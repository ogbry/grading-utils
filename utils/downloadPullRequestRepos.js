#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const path = require('path');
const github = require('@octokit/rest')();
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);

const argv = require('yargs')
  .option('output', {
    alias: 'o',
    default: '.',
    describe: 'the output directory for downloaded repositories',
    type: 'string',
  })
  .option('repo', {
    alias: 'r', 
    describe: 'github repository url',
    demandOption: true,
    type: 'string',
  })
  .option('branch', {
    alias: 'b',
    describe: 'The branch name that should be downloaded from the fork',
    demandOption: true,
    type: 'string',
  }).argv;

const config = {
  outputDir: argv.output,
  repo: argv.repo,
  branch: argv.branch,
};

async function downloadRepoArchives(outputDir, archConfigs) {
  archConfigs.forEach(async config => {
    try {
      const outputPath = path.resolve(
        outputDir,
        `${config.owner}_${config.repo}.tar.gz`
      );
      const repoArchive = await github.repos.getArchiveLink(config);
      await writeFileAsync(outputPath, repoArchive.data);
      console.log(outputPath);
    } catch (e) {
      throw e;
    }
  });
}

function parseRepoUrl(url) {
  const path = new URL(url).pathname.split('/');
  return {
    owner: path[1],
    name: path[2],
  };
}

(async function({ repo, branch, outputDir }) {
  console.error(
    'Downloaded repositories will be placed in: ',
    path.resolve(outputDir)
  );

  try {
    const repoData = parseRepoUrl(repo);

    const finalRepoPulls = await github.pulls.list({
      owner: repoData.owner,
      repo: repoData.name,
      state: 'open',
      sort: 'created',
      per_page: 100,
    });

    const prRepos = finalRepoPulls.data.map(pr => {
      return {
        owner: pr.user.login,
        repo: pr.head.repo.name,
        archive_format: 'tarball',
        ref: branch,
      };
    });

    await downloadRepoArchives(outputDir, prRepos);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
})(config);

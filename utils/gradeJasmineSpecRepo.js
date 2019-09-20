#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Jasmine = require('jasmine');
const glob = require('glob');
const Reporter = require('./simpleJsonJasmineReporter.js');

const argv = require('yargs').option('directories', {
  alias: 'o',
  describe: 'a newline delimited string of directories',
  demandOption: true,
  type: 'string',
}).argv;

const config = {
  dirs: argv.directories,
};

function runTests(dir) {
  const jasmine = new Jasmine();
  const reporter = new Reporter();

  jasmine.clearReporters();
  jasmine.addReporter(reporter);
  jasmine.loadConfig({
    spec_dir: path.join(dir, 'test'),
    // Had to find the absolute paths myself because jasmine couldn't seem to
    // resolve the correct paths.
    spec_files: glob.sync(path.join(dir, 'test/spec/', '*[sS]pec.js')),
    random: false,
  });

  return new Promise((resolve, reject) => {
    jasmine.execute();
    jasmine.onComplete(status => {
      resolve(reporter.results);
    });
  });
}

function parseUser(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'user.json')));
}

(function main({ dirs }) {
  const grades = {};
  dirs.split('\n').forEach(async dir => {
    const user = parseUser(dir);

    try {
      let results = await runTests(dir);
      results.name = user.name;
      grades[user.email] = results;
    } catch (e) {
      grades[user.email] = {
        name: user.name,
        failure: e.message,
      };
    }

    console.log(JSON.stringify(grades));
  });
})(config);
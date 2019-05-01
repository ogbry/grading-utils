#!/usr/bin/env node

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

  jasmine.clearReporters();
  jasmine.addReporter(new Reporter());

  jasmine.loadConfig({
    spec_dir: path.join(dir, 'test'),
    // Had to find the absolute paths myself because jasmine couldn't seem to
    // resolve the correct paths.
    spec_files: glob.sync(path.join(dir, 'test/spec/', '*[sS]pec.js')),
    random: false,
  });

  jasmine.execute();
}

(function main({ dirs }) {
  dirs.split('\n').forEach(dir => {
    runTests(dir);
  });
})(config);

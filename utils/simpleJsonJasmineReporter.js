class Reporter {
  jasmineDone(results) {
    console.log('FAILED: ', results)
  }
}

module.exports = Reporter;

class Reporter {
  constructor() {
    this.results;
    this.specCount;
    this.executableSpecCount;
    this.failureCount;
    this.failedSuites = [];
    this.failedSpecs = [];
    this.pendingSpecs = [];
  }

  jasmineStarted() {
    this.specCount = 0;
    this.executableSpecCount = 0;
    this.failureCount = 0;
  }

  jasmineDone(results) {
    const passed = this.specCount - this.failureCount;
    const passPercentage = Math.round((passed / this.specCount) * 100);
    this.results = {
      percentage: passPercentage,
      passed,
      failed: this.failureCount,
      total: this.specCount,
    };
  }

  specDone(res) {
    this.specCount++;

    if (res.status === 'pending') {
      this.pendingSpecs.push(res);
      this.executableSpecCount++;
    } else if (res.status === 'passed') {
      executableSpecCount++;
    } else if (res.status === 'failed') {
      this.failureCount++;
      this.failedSpecs.push(res);
      this.executableSpecCount++;
    }
  }
}

module.exports = Reporter;

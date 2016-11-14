import storage from '../lib/storage';
import getParam from '../lib/get-param';

const supportsClasslist = 'classList' in document.createElement('_');
const storageKey = 'ab-tests';
const noop = () => {};
const rand = (min, max) => Math.random() * ((max - min) + min);

const chooseWeightedItem = (names, weights) => {
  // Total out the number of weights
  const total = weights.reduce((a, b) => a + b);
  let limit = 0;

  // Get a random number between 0 and the total number of weights
  const n = rand(0, total);

  // Loop until we've encountered the first weight greater than our random number
  for (let i = 0; i < names.length; i += 1) {
    limit += weights[i];

    if (n <= limit) {
      return names[i];
    }
  }
  return '';
};

class Study {
  constructor(name, data = {}, { persist = true, active = true, chosen = noop } = {}) {
    if (!name) { throw new Error('Tests must have a name'); }

    this.name = name;
    this.data = data;
    this.persist = persist;
    this.active = active;
    this.chosen = chosen;

    if (!this.active) {
      return {
        active: false,
      };
    }

    this.fetchTests();
    this.assignBucket();
    return this.dispatchTest();
  }

  fetchTests() {
    // Set test name
    let tests = storage.local.getItem(storageKey);
    if (tests) {
      try {
        tests = JSON.parse(tests);
      } catch (e) {
        tests = {};
      }
    } else {
      tests = {};
    }
    this.tests = tests;
  }

  assignBucket() {
    // Grab assignment via query param. Syntax:
    // ?assign=test:bucket
    const [assignTest, assignBucket] = (getParam('assign') || '').split(':');
    const assignmentMatchesName = assignTest === this.name;
    const isValidBucket = assignBucket in this.data;

    const useStoredAssignment = this.persist && this.tests[this.name];
    const shouldAssign = (assignmentMatchesName && isValidBucket) || !useStoredAssignment;
    // Retrieve Bucket from storage if possible


    if (!shouldAssign) {
      this.bucket = this.tests[this.name].bucket;
    } else {
      // Determine Bucket
      // Get a list of test names and test weights
      const names = Object.keys(this.data);
      const weights = [];

      names.forEach((bucketName) => {
        if (typeof this.data[bucketName].weight === 'undefined') {
          this.data[bucketName].weight = 1;
        }
        weights.push(this.data[bucketName].weight);
      });

      // Use query param assignment if possible
      if (assignmentMatchesName && isValidBucket) {
        this.bucket = assignBucket;

      // Select a random weighted bucket
      } else {
        this.bucket = chooseWeightedItem(names, weights);
      }

      // Save
      this.tests[this.name] = {
        bucket: this.bucket,
        buckets: Object.keys(this.data),
      };
      storage.local.setItem(storageKey, JSON.stringify(this.tests));
    }
  }

  dispatchTest() {
    // We've now bucketed our user
    // Add classname
    const className = `${this.name}--${this.bucket}`;
    if (supportsClasslist) {
      document.body.classList.add(className);
    } else {
      document.body.className += ` ${className}`;
    }
    const { bucket } = this;
    const info = {
      bucket,
      data: this.data[bucket],
      active: true,
    };

    // Call function if provided
    if (this.data[bucket]) {
      if (!this.data[bucket].chosen) this.data[bucket].chosen = noop;
      this.data[bucket].chosen.call(this);
    }

    // Call chosen function
    if (this.chosen) { this.chosen.call(this, info); }

    // Record test with GTM if possible
    if (typeof dataLayer !== 'undefined') {
      const metrics = {
        abTests: {},
      };
      metrics.abTests[this.name] = bucket;
      dataLayer.push(metrics);
    }
    // Return
    return info;
  }
}

export default Study;

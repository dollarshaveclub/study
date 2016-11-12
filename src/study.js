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
  constructor(name, defaultData = {}, { persist = true, active = true, chosen = noop } = {}) {
    const data = defaultData;

    if (!name) { throw new Error('Tests must have a name'); }

    // Return if inactive
    if (!active) {
      return {
        active: false,
      };
    }

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

    let bucket;

    // Grab assignment via query param. Syntax:
    // ?assign=test:bucket
    const [assignTest, assignBucket] = (getParam('assign') || '').split(':');
    const assignmentMatchesName = assignTest === name;
    const isValidBucket = assignBucket in data;

    const useStoredAssignment = persist && tests[name];
    const shouldAssign = (assignmentMatchesName && isValidBucket) || !useStoredAssignment;

    // Retrieve Bucket from storage if possible
    if (!shouldAssign) {
      bucket = tests[name].bucket;
    } else {
      // Determine Bucket
      // Get a list of test names and test weights
      const names = Object.keys(data);
      const weights = [];

      names.forEach((bucketName) => {
        if (typeof data[bucketName].weight === 'undefined') {
          data[bucketName].weight = 1;
        }
        weights.push(data[bucketName].weight);
      });

      // Use query param assignment if possible
      if (assignmentMatchesName && isValidBucket) {
        bucket = assignBucket;

      // Select a random weighted bucket
      } else {
        bucket = chooseWeightedItem(names, weights);
      }

      // Save
      tests[name] = {
        bucket,
        buckets: Object.keys(data),
      };
      storage.local.setItem(storageKey, JSON.stringify(tests));
    }

    // We've now bucketed our user
    // Add classname
    const className = `${name}--${bucket}`;
    if (supportsClasslist) {
      document.body.classList.add(className);
    } else {
      document.body.className += ` ${className}`;
    }

    const info = {
      bucket,
      data: data[bucket],
      active: true,
    };

    // Call function if provided
    if (data[bucket]) {
      if (!data[bucket].chosen) data[bucket].chosen = noop;
      data[bucket].chosen.call(this);
    }

    // Call chosen function
    if (chosen) { chosen.call(this, info); }

    // Record test with GTM if possible
    if (typeof dataLayer !== 'undefined') {
      const metrics = {
        abTests: {},
      };
      metrics.abTests[name] = bucket;
      dataLayer.push(metrics);
    }

    // Return
    return info;
  }
}

export default Study;

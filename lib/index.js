import storage from '../vendor/storage';
import camelize from '../vendor/camelize';

const supportsClasslist = "classList" in document.createElement("_");
const storageKey = 'ab-tests';

class Test {
  constructor(name, data = {}, options = {}) {
    options = {
      persist: typeof options.persist !== "undefined" ? options.persist : true,
      active: typeof options.active !== "undefined" ? options.active : true,
      chosen: typeof options.chosen !== "undefined" ? options.chosen : false
    };

    if(!name) { throw new Error('Tests must have a name'); }

    // Return if inactive
    if (!options.active) {
      return {
        active: false
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

    // Support Legacy Test Structure, deprecate soon
    let legacyBucket = storage.local.getItem(`test-${name}`);
    if (legacyBucket) {
      console.warn('Migrating tests');
      tests[name] = {
        bucket: legacyBucket,
        buckets: Object.keys(data)
      };
      storage.local.setItem(storageKey, JSON.stringify(tests));
      storage.local.removeItem(`test-${name}`);
    }

    // Retrieve Bucket from storage if possible
    if (options.persist && tests[name]) {
      bucket = tests[name].bucket;
    }

    // Determine bucket
    else {

      // Get a list of test names and test weights
      let names = Object.keys(data);
      let weights = [];
      for (var i = 0; i < names.length; i++) {
        if (typeof data[names[i]].weight == "undefined")
          data[names[i]].weight = 1;
        weights.push( data[names[i]].weight );
      }

      // Select a random weighted bucket
      bucket = Test.chooseWeightedItem(names, weights);

      // Save
      tests[name] = {
        bucket: bucket,
        buckets: Object.keys(data)
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

    let info = {
      bucket: bucket,
      data: data[bucket],
      active: true
    };

    // Call function if provided
    if (data[bucket]) {
      if (!data[bucket].chosen) data[bucket].chosen = Test.noop;
      data[bucket].chosen.call(this);
    }

    // Call chosen function
    if (options.chosen) { options.chosen.call(this, info); }

    // Record test with GTM if possible
    if(typeof dataLayer !== "undefined") {
      var metrics = {
        abTests: {}
      };
      metrics.abTests[camelize(name)] = bucket;
      dataLayer.push(metrics);
    }

    // Return
    return info;
  }

  static chooseWeightedItem (names, weights) {

    // Total out the number of weights
    var total = 0, i;
    for(i = 0; i < weights.length; i++) {
      total += weights[i];
    }

    var sum = 0;

    // Get a random number between 0 and the total number of weights
    var n = Test.rand(0, total);

    // Loop until we've encountered the first weight greater than our random number
    for (i = 0; i < names.length; i++) {
      sum += weights[i];

      if (n <= sum) {
        return names[i];
      }
    }
  }

  static noop () {}

  static rand (min, max) {
    return Math.random() * (max - min) + min;
  }
}

export default Test;

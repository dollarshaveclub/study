const isServer = !!(typeof module !== 'undefined' && module.exports);
const storageKey = 'ab-tests';
const rand = (min, max) => (Math.random() * (max - min)) + min;

/**
 * Randomly chooses a bucket, using the given weights.
 *
 * To visualize, arrange bucket weight intervals continuously along a number line.
 * The total range equals the sum of the bucket weights (100 is best).
 * Sections within the range represent each bucket.
 * Walk the line a random distance to find the chosen bucket.
 *
 * Gets a random number between 0 and the sum of bucket weights (the range).
 * Finds the bucket interval within the range containing our random number.
 *
 * We use a for loop instead of Array.reduce because we chose to structure
 * our data as two parallel arrays.
 *
 * @param {Array} names       bucket names
 * @param {Array} weights     bucket weights
 * @return {String}           chosen bucket name
 */
const chooseWeightedItem = (names, weights) => {
  const sum = weights.reduce((a, b) => a + b);
  let limit = 0;
  const n = rand(0, sum);
  for (let i = 0; i < names.length; i += 1) {
    limit += weights[i];
    if (n <= limit) return names[i];
  }
  return '';
};

/**
 * Formats providedTests to be consumed by the end developer
 * @param  {Array} providedTests List of tests
 * @return {Array|Object}        An array or object depending on the length of providedTests
 */
const response = tests => tests.length === 1 ? tests[0] : tests;

class Study {

  /**
   * The Study constructor. Initializes the store, tests, and restores persisted user buckets
   * @type {Function}
   */
  constructor({ store = Study.stores.local } = {}) {
    this.store = store;
    if (!this.store.isSupported()) {
      console.warn(`Provided store '${store.type}' is not supported. Falling back to 'memory' store`);
      this.store = Study.stores.memory;
    }

    this.userBuckets = {};
    this.userAssignments = {};
    this.providedTests = [];
    this.classList = {};

    const userBuckets = this.store.get(storageKey);
    if (userBuckets) {
      try {
        this.userBuckets = JSON.parse(userBuckets);
      } catch (e) {
        this.userBuckets = {};
      }
    }
  }

  /**
   * Define a single or multiple tests
   * @param {Object} data An object or an array of objects containing the test
   * info such as name and buckets
   */
  define(data) {
    let normalizedData = data;
    if (!Array.isArray(data)) { normalizedData = [data]; }

    normalizedData.forEach((test) => {
      if (!test.name) { throw new Error('Tests must have a name'); }
      if (!test.buckets) { throw new Error('Tests must have buckets'); }
      if (!Object.keys(test.buckets)) { throw new Error('Tests must have buckets'); }
      this.providedTests = this.providedTests.concat(test);
    });
  }

  /**
   * Return all defined tests
   * @return {Array} Formatted/provided tests
   */
  definitions() {
    return response(this.providedTests);
  }

  /**
   * Executes the bucketing of all provided tests. Will bucket a user if the
   * query string is set, then falls back to restoring a persisted bucket, then
   * falls back to determining a bucket for the user.
   * @type {Function}
   * @param {Boolean} isDry If true, will not persist test buckets
   */
  assign(testName, bucketName) {
    const applyClasses = () => {
      Object.keys(this.classList).forEach((name) => {
        const classesToRemove = document.body.className.split(/\s+/g)
          .map(x => x.trim())
          .filter(Boolean)
          .filter(x => x.indexOf(`${name}--`) === 0);
        classesToRemove.forEach(className => document.body.classList.remove(className));
        if (this.classList[name]) document.body.classList.add(`${name}--${this.classList[name]}`);
      });
      document.removeEventListener('DOMContentLoaded', applyClasses);
    };

    this.providedTests.forEach((test) => {
      const shouldPersist = test.name in this.userBuckets;
      const shouldBucket = bucketName && testName && testName === test.name;
      const shouldSkipTest = testName && test.name !== testName;
      const shouldRemoveBucket = bucketName === null;
      let bucket;

      // Don't bucket a different test if we're specifying one
      if (shouldSkipTest) return;

      // Specify bucket
      if (shouldRemoveBucket) {
        bucket = bucketName;
      } else if (shouldBucket) {
        // Restore a persisted bucket
        bucket = bucketName;
      } else if (shouldPersist) {
        // Restore a persisted bucket
        bucket = this.userBuckets[test.name];
      } else {
        // Determine Bucket
        const names = Object.keys(test.buckets);
        const weights = [];

        names.forEach((innerBucketName) => {
          let weight = test.buckets[innerBucketName].weight;
          if (typeof weight === 'undefined') {
            weight = 1;
          }
          weights.push(weight);
        });
        bucket = chooseWeightedItem(names, weights);
      }

      if (shouldRemoveBucket) {
        this.classList[test.name] = null;
        delete this.userAssignments[test.name];
      } else {
        // Add to our assignments
        this.classList[test.name] = bucket;
        this.userAssignments[test.name] = bucket;
      }
    });

    if (!isServer && document.body) applyClasses();
    else document.addEventListener('DOMContentLoaded', applyClasses);

    // Persist buckets
    this.persist(this.userAssignments);
  }

  /**
   * Fetch all of the buckets belonging to a user
   * @type {Function}
   * @return {Object} Object whose keys are test names and values are the buckets
   * a user has been placed in
   */
  assignments() {
    return this.userAssignments;
  }

  /**
   * Saves information in the store to be retrieved at a later point
   * @type {Function}
   * @param {Object} data The data to save to the store
   */
  persist(data) {
    this.store.set(storageKey, JSON.stringify(data));
  }

  /**
   * An object housing all of the different stores available to us
   * @type {Object}
   */
  static stores = {
    local: {
      type: 'local',
      get: key => localStorage.getItem(key),
      set: (key, val) => localStorage.setItem(key, val),
      isSupported: () => {
        if (typeof localStorage !== 'undefined') return true;
        const uid = new Date();
        try {
          localStorage.setItem(uid, uid);
          localStorage.removeItem(uid);
          return true;
        } catch (e) {
          return false;
        }
      },
    },
    memory: (function memoryStore() {
      const store = {};
      return {
        type: 'memory',
        get: key => store[key],
        set: (key, val) => {
          store[key] = val;
        },
        isSupported: () => true,
      };
    }()),
    browserCookie: {
      type: 'browserCookie',
      /*eslint-disable */
      get: key => decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null,
      set: (key, val) => document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(val)}; expires=expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`,
      /*eslint-enable */
      isSupported: () => !isServer,
    },
  };
}

export default Study;

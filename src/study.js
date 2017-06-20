
import {
  chooseWeightedItem,
  getDefaultBucket,
  validateStore,
} from './utils';

export default class Study {
  constructor(options = {}) {
    Object.assign(this, {
      storageKey: 'ab-tests',
      root: typeof document !== 'undefined' ? document.body : null,
    }, options);

    validateStore(this.store);

    this.previousAssignments = {};
    try {
      // assert that the data is a JSON string
      // that represents a JSON object
      // saw a bug where it was, for some reason, stored as `null`
      const data = this.store.get(this.storageKey);
      if (typeof data === 'string' && data[0] === '{') {
        this.previousAssignments = JSON.parse(data);
      }
    } catch (_) {
      // ignore
    }

    this.userAssignments = {};
    this.persistedUserAssignments = {};
    this.providedTests = [];
  }

  define(tests) {
    let normalizedData = tests;
    if (!Array.isArray(tests)) normalizedData = [tests];

    normalizedData.forEach((test) => {
      if (!test.name) throw new Error('Tests must have a name');
      if (!test.buckets) throw new Error('Tests must have buckets');
      if (!Object.keys(test.buckets)) throw new Error('Tests must have buckets');
      this.providedTests.push(test);
    });
  }

  definitions() {
    return this.providedTests;
  }

  removeClasses(testName, exceptClassName) {
    const { root } = this;
    if (!root) return;

    // classList does not support returning all classes
    const currentClassNames = root.className.split(/\s+/g)
      .map(x => x.trim())
      .filter(Boolean);

    currentClassNames
      .filter(x => x.indexOf(`${testName}--`) === 0)
      .filter(className => className !== exceptClassName)
      .forEach(className => root.classList.remove(className));
  }

  applyClasses() {
    const { userAssignments, root } = this;
    if (!root) return;

    Object.keys(userAssignments).forEach((testName) => {
      const bucket = userAssignments[testName];

      const className = bucket ? `${testName}--${bucket}` : null;
      // remove all classes related to this bucket
      this.removeClasses(testName, className);

      // only assign a class is the test is assigned to a bucket
      // this removes then adds a class, which is not ideal but is clean
      if (className) root.classList.add(className);
    });
  }

  assignAll() {
    const {
      previousAssignments,
      userAssignments,
      persistedUserAssignments,
    } = this;

    this.providedTests.forEach((test) => {
      // winners take precedence
      {
        const winner = Object.keys(test.buckets)
          .filter(name => test.buckets[name].winner)[0];
        if (winner) {
          userAssignments[test.name] = winner;
          return;
        }
      }

      // already assigned, probably because someone
      // called `.assignAll()` twice.
      if (userAssignments[test.name]) return;

      {
        // previously assigned, so we continue to persist it
        const bucket = previousAssignments[test.name];
        if (bucket && test.buckets[bucket]) {
          const assignment = previousAssignments[test.name];
          persistedUserAssignments[test.name] = assignment;
          userAssignments[test.name] = assignment;
          return;
        }
      }

      // inactive tests should be set to default
      if (test.active === false) {
        userAssignments[test.name] = getDefaultBucket(test.buckets);
        return;
      }

      // randomly assign
      {
        const names = Object.keys(test.buckets);
        const weights = [];

        names.forEach((innerBucketName) => {
          let weight = test.buckets[innerBucketName].weight;
          if (weight == null) weight = 1;
          weights.push(weight);
        });

        const assignment = chooseWeightedItem(names, weights);
        persistedUserAssignments[test.name] = assignment;
        userAssignments[test.name] = assignment;
      }
    });

    this.persist();
    this.applyClasses();
  }

  assign(testName, bucketName) {
    if (!testName) return this.assignAll();

    const test = this.providedTests.filter(x => x.name === testName)[0];
    if (bucketName === null || !test) {
      delete this.userAssignments[testName];
      delete this.persistedUserAssignments[testName];
      this.persist();
      this.removeClasses(testName);
      return;
    }

    const assignment = bucketName || getDefaultBucket(test.buckets);
    this.userAssignments[testName] = assignment;
    this.persistedUserAssignments[testName] = assignment;

    this.persist();
    this.applyClasses();
  }

  assignments() {
    return this.userAssignments;
  }

  persist() {
    this.store.set(this.storageKey, JSON.stringify(this.persistedUserAssignments));
  }
}

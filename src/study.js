
import { chooseWeightedItem, getDefaultBucket } from './utils';

export default class Study {
  constructor(options = {}) {
    Object.assign(this, {
      storageKey: 'ab-tests',
      root: typeof document !== 'undefined' ? document.body : null,
    }, options);

    if (!this.store) throw new Error('You must supply a store!');

    try {
      this.previousAssignments = JSON.parse(this.store.get(this.storageKey)) || {};
    } catch (_) {
      this.previousAssignments = {};
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
      this.removeClasses(testName, className);

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

      // already assigned
      if (userAssignments[test.name]) return;

      {
        // previously assigned, so we continue to persist it
        const bucket = previousAssignments[test.name];
        if (bucket && test.buckets[bucket]) {
          persistedUserAssignments[test.name] =
          userAssignments[test.name] = previousAssignments[test.name];
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
          if (typeof weight === 'undefined') {
            weight = 1;
          }
          weights.push(weight);
        });

        persistedUserAssignments[test.name] =
        userAssignments[test.name] = chooseWeightedItem(names, weights);
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
      this.removeClasses(testName);
    } else {
      this.userAssignments[testName] =
      this.persistedUserAssignments[testName] = bucketName || getDefaultBucket(test.buckets);
    }

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

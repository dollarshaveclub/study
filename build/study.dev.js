/**
  studyjs - A client side A/B tester
  @version v5.0.2
  @link https://github.com/dollarshaveclub/study
  @author Jacob Kelley <jacob.kelley@dollarshaveclub.com>
  @license MIT
**/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Study = factory());
}(this, function () { 'use strict';

  var rand = function rand(min, max) {
    return Math.random() * (max - min) + min;
  }; // choose a random value with the specified weights

  var chooseWeightedItem = function chooseWeightedItem(names, weights) {
    if (names.length !== weights.length) throw new Error('names and weights must have equal length!');
    var sum = weights.reduce(function (a, b) {
      return a + b;
    }, 0);
    var limit = 0;
    var n = rand(0, sum);

    for (var i = 0; i < names.length; i++) {
      limit += weights[i];
      if (n <= limit) return names[i];
    } // by default, return the last weight


    return names[names.length - 1];
  }; // get the default bucket,
  // which is either the default/winner,
  // otherwise whichever is returned first

  var getDefaultBucket = function getDefaultBucket(buckets) {
    var defaultBuckets = Object.keys(buckets).filter(function (name) {
      var x = buckets[name];
      return x.default || x.winner;
    });
    return defaultBuckets[0] || Object.keys(buckets)[0];
  };
  var validateStore = function validateStore(store) {
    if (!store) throw new Error('You must supply a store!');
    if (typeof store.get !== 'function') throw new Error('The store must implement .get()');
    if (typeof store.set !== 'function') throw new Error('The store must implement .set()');
    if (typeof store.isSupported !== 'function') throw new Error('The store must implement .isSupported()');
    if (!store.isSupported()) throw new Error('The store is not supported.');
  };
  var getRandomAssignment = function getRandomAssignment(test) {
    var names = Object.keys(test.buckets);
    var weights = [];
    names.forEach(function (innerBucketName) {
      var weight = test.buckets[innerBucketName].weight;
      if (weight == null) weight = 1;
      weights.push(weight);
    });
    return chooseWeightedItem(names, weights);
  };

  var Study =
  /*#__PURE__*/
  function () {
    function Study(options) {
      if (options === void 0) {
        options = {};
      }

      Object.assign(this, {
        storageKey: 'ab-tests',
        root: typeof document !== 'undefined' ? document.body : null
      }, options);
      validateStore(this.store);
      this.previousAssignments = {};

      try {
        // assert that the data is a JSON string
        // that represents a JSON object
        // saw a bug where it was, for some reason, stored as `null`
        var data = this.store.get(this.storageKey);

        if (typeof data === 'string' && data[0] === '{') {
          this.previousAssignments = JSON.parse(data);
        }
      } catch (_) {// ignore
      }

      this.userAssignments = {};
      this.persistedUserAssignments = {};
      this.providedTests = [];
    }

    var _proto = Study.prototype;

    _proto.define = function define(tests) {
      var _this = this;

      var normalizedData = tests;
      if (!Array.isArray(tests)) normalizedData = [tests];
      normalizedData.forEach(function (test) {
        if (!test.name) throw new Error('Tests must have a name');
        if (!test.buckets) throw new Error('Tests must have buckets');
        if (!Object.keys(test.buckets)) throw new Error('Tests must have buckets');

        _this.providedTests.push(test);
      });
    };

    _proto.definitions = function definitions() {
      return this.providedTests;
    };

    _proto.removeClasses = function removeClasses(testName, exceptClassName) {
      var root = this.root;
      if (!root) return; // classList does not support returning all classes

      var currentClassNames = root.className.split(/\s+/g).map(function (x) {
        return x.trim();
      }).filter(Boolean);
      currentClassNames.filter(function (x) {
        return x.indexOf(testName + "--") === 0;
      }).filter(function (className) {
        return className !== exceptClassName;
      }).forEach(function (className) {
        return root.classList.remove(className);
      });
    };

    _proto.applyClasses = function applyClasses() {
      var _this2 = this;

      var userAssignments = this.userAssignments,
          root = this.root;
      if (!root) return;
      Object.keys(userAssignments).forEach(function (testName) {
        var bucket = userAssignments[testName];
        var className = bucket ? testName + "--" + bucket : null; // remove all classes related to this bucket

        _this2.removeClasses(testName, className); // only assign a class is the test is assigned to a bucket
        // this removes then adds a class, which is not ideal but is clean


        if (className) root.classList.add(className);
      });
    };

    _proto.assignAll = function assignAll() {
      var previousAssignments = this.previousAssignments,
          userAssignments = this.userAssignments,
          persistedUserAssignments = this.persistedUserAssignments;
      this.providedTests.forEach(function (test) {
        // winners take precedence
        {
          var winner = Object.keys(test.buckets).filter(function (name) {
            return test.buckets[name].winner;
          })[0];

          if (winner) {
            userAssignments[test.name] = winner;
            return;
          }
        } // already assigned, probably because someone
        // called `.assignAll()` twice.

        if (userAssignments[test.name]) return;
        {
          // previously assigned, so we continue to persist it
          var bucket = previousAssignments[test.name];

          if (bucket && test.buckets[bucket]) {
            var assignment = previousAssignments[test.name];
            persistedUserAssignments[test.name] = assignment;
            userAssignments[test.name] = assignment;
            test.active = true;
            return;
          }
        } // inactive tests should be set to default

        if (test.active === false) {
          userAssignments[test.name] = getDefaultBucket(test.buckets);
          return;
        } // randomly assign


        {
          var _assignment = getRandomAssignment(test);

          persistedUserAssignments[test.name] = _assignment;
          userAssignments[test.name] = _assignment;
        }
      });
      this.persist();
      this.applyClasses();
    };

    _proto.assign = function assign(testName, bucketName) {
      if (!testName) return this.assignAll();
      var test = this.providedTests.filter(function (x) {
        return x.name === testName;
      })[0];

      if (bucketName === null || !test) {
        delete this.userAssignments[testName];
        delete this.persistedUserAssignments[testName];
        this.persist();
        this.removeClasses(testName);
        return;
      }

      var assignment = bucketName || getRandomAssignment(test);
      this.userAssignments[testName] = assignment;
      this.persistedUserAssignments[testName] = assignment;
      test.active = true;
      this.persist();
      this.applyClasses();
    };

    _proto.extendAssignments = function extendAssignments(assignments) {
      return assignments;
    };

    _proto.assignments = function assignments() {
      return this.extendAssignments(this.userAssignments);
    };

    _proto.persist = function persist() {
      this.store.set(this.storageKey, JSON.stringify(this.persistedUserAssignments));
    };

    return Study;
  }();

  // NOTE: use a module
  var browserCookie = (function () {
    return {
      type: 'browserCookie',

      /*eslint-disable */
      get: function get(key) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
      },
      set: function set(key, val) {
        var expirationDate = new Date('12/31/9999').toUTCString();
        document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(val) + "; expires=" + expirationDate + "; path=/";
      },

      /* eslint-enable */
      isSupported: function isSupported() {
        return typeof document !== 'undefined';
      }
    };
  });

  var local = (function () {
    return {
      type: 'local',
      get: function get(key) {
        return localStorage.getItem(key);
      },
      set: function set(key, val) {
        return localStorage.setItem(key, val);
      },
      isSupported: function isSupported() {
        if (typeof localStorage !== 'undefined') return true;
        var uid = new Date();

        try {
          localStorage.setItem(uid, uid);
          localStorage.removeItem(uid);
          return true;
        } catch (e) {
          return false;
        }
      }
    };
  });

  var memory = (function () {
    var store = Object.create(null);
    return {
      type: 'memory',
      get: function get(key) {
        return store[key];
      },
      set: function set(key, val) {
        store[key] = val;
      },
      isSupported: function isSupported() {
        return true;
      }
    };
  });

  // this is the build for webpack and UMD builds
  var stores = {
    browserCookie: browserCookie(),
    local: local(),
    memory: memory()
  };
  window.Study = Study;
  Study.stores = stores;

  return Study;

}));

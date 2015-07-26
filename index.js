(function() {

  var utils = {
    rand: function(min, max) {
      return Math.random() * (max - min) + min;
    },
    chooseWeightedItem: function(names, weights) {

      var total = weights.reduce(function (prev, cur, i, arr) {
        return prev + cur;
      });

      var sum = 0;
      var n = utils.rand(0, total);

      for (var i = 0; i < names.length; i++) {
        sum += weights[i];

        if (n <= sum) {
          return names[i];
        }
      }
    }
  };

  var Test = function(name, data, options) {

    options = options || {};
    options.persist = typeof options.persist !== "undefined" ? options.persist : true;

    var storageKey = 'test-' + name;
    var bucket;

    // Retrieve Bucket from storage
    if (options.persist && sessionStorage.getItem(storageKey)) {
      bucket = sessionStorage.getItem(storageKey);
    }

    // Determine bucket
    else {

      // Get a list of test names and test weights
      var names = Object.keys(data);
      var weights = [];
      for (var i = 0; i<names.length; i++) {
        weights.push( data[names[i]].weight );
      }

      // Select a random bucket via weights
      bucket = utils.chooseWeightedItem(names, weights);

      // Save
      sessionStorage.setItem(storageKey, bucket);
    }

    // Execute test
    document.body.classList.add(name, bucket); // Add classname
    if(data[bucket] && data[bucket].chosen) {
      // Call function if provided
      data[bucket].chosen.call(this);
    }

    // Record test
    if(typeof dataLayer !== "undefined") {
      var metrics = {
        abTests: {}
      };
      metrics.abTests[name] = bucket;
      dataLayer.push(metrics);
    }

    return {
      bucket: bucket,
      data: data[bucket]
    };
  };

  window.Test = Test;
})();

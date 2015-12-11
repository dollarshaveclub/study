(function() {

  var utils = {

    /**
     * Returns a random number between min and max
     * @param  {Number} min The lower bound, inclusive
     * @param  {Number} max The upper bound, exclusive
     * @return {Number} Random number
     */
    rand: function(min, max) {
      return Math.random() * (max - min) + min;
    },

    /**
     * Fetches a random number and loops through the bounds of weights
     * @param  {Array} names   List of test names (Strings)
     * @param  {Array} weights List of test weights (Numbers)
     * @return {String}        Chosen test name
     *
     * .1 / 1 = 10% / 90%
     * .25 / .75 = 33% / 60%
     * .25 / 1 = 25% / 75%
     *
     * Weight sums represent the bounds.
     */
    chooseWeightedItem: function(names, weights) {

      // Total out the number of weights
      var total = 0, i;
      for(i = 0; i < weights.length; i++) {
        total += weights[i];
      }

      var sum = 0;

      // Get a random number between 0 and the total number of weights
      var n = utils.rand(0, total);

      // Loop until we've encountered the first weight greater than our random number
      for (i = 0; i < names.length; i++) {
        sum += weights[i];

        if (n <= sum) {
          return names[i];
        }
      }
    }
  };

  /**
   * Test constructor
   * @param  {String} name    Name of the test
   * @param  {Object} data    Tests to execute
   * @param  {Object} options Additional options
   * @return {Object}         Selected test
   */
  var Test = function(name, data, options) {

    if(!name) { throw new Error('Tests must have a name'); }

    // Ensure options exists
    options = options || {};
    options = {
      persist: typeof options.persist !== "undefined" ? options.persist : true,
      active: typeof options.active !== "undefined" ? options.active : true,
      chosen: typeof options.chosen !== "undefined" ? options.chosen : false
    };

    // Return if inactive
    if (!options.active) {
      return {
        active: false
      };
    }

    // Set test name
    var storageKey = 'test-' + name;
    var bucket;

    // Retrieve Bucket from storage if possible
    if (options.persist && sessionStorage.getItem(storageKey)) {
      bucket = sessionStorage.getItem(storageKey);
    }

    // Determine bucket
    else {

      // Get a list of test names and test weights
      var names = Object.keys(data);
      var weights = [];
      for (var i = 0; i<names.length; i++) {
        if(typeof data[names[i]].weight == "undefined") data[names[i]].weight = 1;
        weights.push( data[names[i]].weight );
      }

      // Select a random weighted bucket
      bucket = utils.chooseWeightedItem(names, weights);

      // Save
      sessionStorage.setItem(storageKey, bucket);
    }

    // We've now bucketed our user
    // Add classname
    document.body.classList.add(name);
    document.body.classList.add(bucket);

    var info = {
      bucket: bucket,
      data: data[bucket],
      active: true
    };

    if(options.chosen) console.log(options.chosen);

    // Call function if provided
    if (data[bucket]) {
      if (!data[bucket].chosen) data[bucket].chosen = Test.noop;
      data[bucket].chosen.call(this);
    }

    // Call chosen function
    if(options.chosen) { options.chosen.call(this, info); }

    // Record test with GTM if possible
    if(typeof dataLayer !== "undefined") {
      var metrics = {
        abTests: {}
      };
      metrics.abTests[name] = bucket;
      dataLayer.push(metrics);
    }

    // Return
    return info;
  };

  Test.noop = function() {};

  window.Test = Test;
})();

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
     */
    chooseWeightedItem: function(names, weights) {

      // Total out the number of weights
      var total = 0, i;
      for(i = 0; i < weights.length; i++) {
        total += weights[i];
      }

      var sum = 0;
      var n = utils.rand(0, total);

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

    // Ensure options exists
    options = options || {};
    options = {
      persist: typeof options.persist !== "undefined" ? options.persist : true
    };

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
        if(!data[names[i]].weight) data[names[i]].weight = 1;
        weights.push( data[names[i]].weight );
      }

      // Select a random weighted bucket
      bucket = utils.chooseWeightedItem(names, weights);

      // Save
      sessionStorage.setItem(storageKey, bucket);
    }

    // Add classname
    document.body.classList.add(name);
    document.body.classList.add(bucket);

    // Call function if provided

    if (data[bucket]) {
      if (!data[bucket].chosen) data[bucket].chosen = Test.noop;
      data[bucket].chosen.call(this);
    }

    // Record test with GTM
    if(typeof dataLayer !== "undefined") {
      var metrics = {
        abTests: {}
      };
      metrics.abTests[name] = bucket;
      dataLayer.push(metrics);
    }

    // Return
    return {
      bucket: bucket,
      data: data[bucket]
    };
  };

  Test.noop = function() {};

  window.Test = Test;
})();

(function () {

  // Element creator
  function _e(tag, props, content) {
    var el = document.createElement(tag);
    for (var prop in props) {
      el[prop] = props[prop];
    }
    if(typeof content == "string") {
      el.innerHTML = content;
    } else {
      el.appendChild(content);
    }
    return el;
  }

  var initialized = false;
  window.TestManager = function () {
    initialized = true;

    function render() {
      var list = _e('ul');
      var tests
      _e('div', {
        style: [
          'position: fixed;',
          'top: 0; right: 0;',
        ].join('');
      }, list);
    }

    render();
  };

})();

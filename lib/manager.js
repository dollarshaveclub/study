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

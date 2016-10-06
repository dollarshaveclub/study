var expect = chai.expect;

var utils = {
  roughlyEqual: function(a, b, range) {
    return Math.abs(a-b) < (range || 3);
  }
};

beforeEach(function () {
  window.dataLayer = [];
});

describe('Tester', function() {

  it('should create an AB test', function() {

    var name = 'test-1';
    var didChoose = false;

    var chosen = new Test(name, {
      foo: {
        weight: 1,
        chosen: function() {
          didChoose = true;
        }
      }
    });

    expect(didChoose).to.equal(true);
    expect(chosen.bucket).to.equal('foo');
    expect(dataLayer.length).to.equal(1);
    expect(dataLayer[0].abTests[name]).to.equal('foo');
    expect(document.body.classList.contains(name)).to.equal(true);
    expect(document.body.classList.contains('foo')).to.equal(true);
  });

  it('should call `chosen` on an AB test', function() {
    var chosen = false;

    new Test('test-1', {
      foo: { weight: 1 },
      bar: { weight: 0 }
    }, {
      chosen: function (info) {
        chosen = true;
        expect(info.bucket).to.equal('foo');
      }
    });

    expect(chosen).to.equal(true);

  });

  it('should create an AB test with metadata', function() {

    var chosen = new Test('my-test', {
      foo: { weight: 1, hello: 'world', brian: 'sucks' }
    });
    expect(chosen.data.hello).to.equal("world");
    expect(chosen.data.brian).to.equal("sucks");
  });

  it('should create a persistent AB test', function() {

    var passes = 10000;
    var tests = {
      foo: { weight: 5 },
      bar: { weight: 5 }
    };

    var selected = {};
    for(var i = 0; i<passes; i++) {

      var chosen = new Test('test-2', tests);

      if(!selected[chosen.bucket]) {
        selected[chosen.bucket] = 0;
      }
      selected[chosen.bucket]++;
    }

    var keys = Object.keys(selected);
    expect(selected[keys[0]]).to.equal(passes);
  });


  it('should create an equally weighted AB test', function() {

    var passes = 10000;
    var tests = {
      foo: { weight: 1 },
      bar: { weight: 1 }
    };

    var selected = {};
    for(var i = 0; i<passes; i++) {

      var chosen = new Test('test-3', tests, {
        persist: false
      });

      if(!selected[chosen.bucket]) {
        selected[chosen.bucket] = 0;
      }
      selected[chosen.bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo/passes)*100, 50)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar/passes)*100, 50)).to.equal(true);
  });


  it('should create an unequally weighted AB test', function() {

    var passes = 10000;
    var tests = {
      foo: { weight: 3 },
      bar: { weight: 1 }
    };

    var selected = {};
    for(var i = 0; i<passes; i++) {

      var chosen = new Test('test-4', tests, {
        persist: false
      });

      if(!selected[chosen.bucket]) {
        selected[chosen.bucket] = 0;
      }
      selected[chosen.bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo/passes)*100, 75)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar/passes)*100, 25)).to.equal(true);
  });


  it('should create an unequally weighted ABCD test', function () {

    var passes = 10000;
    var tests = {
      foo: { weight: 3 },
      bar: { weight: 5 },
      baz: { weight: 2 },
      wat: { weight: 8 }
    };

    var selected = {};
    for(var i = 0; i<passes; i++) {

      var chosen = new Test('test-5', tests, {
        persist: false
      });

      if(!selected[chosen.bucket]) {
        selected[chosen.bucket] = 0;
      }
      selected[chosen.bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo/passes)*100, 16)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar/passes)*100, 27)).to.equal(true);
    expect(utils.roughlyEqual((selected.baz/passes)*100, 11)).to.equal(true);
    expect(utils.roughlyEqual((selected.wat/passes)*100, 44)).to.equal(true);
  });

  it('should create a test with 0% weighted buckets', function () {

    var passes = 10;
    var tests = {
      foo: { weight: 0 },
      bar: { weight: 0 },
      baz: { weight: 1 },
    };

    var selected = {};
    for(var i = 0; i<passes; i++) {

      var chosen = new Test('test-6', tests, {
        persist: false
      });

      if(!selected[chosen.bucket]) {
        selected[chosen.bucket] = 0;
      }
      selected[chosen.bucket]++;
    }
    expect(selected.foo).to.be.undefined;
    expect(selected.bar).to.be.undefined;
    expect(selected.baz).to.equal(passes);
  });

  it('should create an inactive test', function () {
    var chosen = new Test('test-7', {}, {
      active: false
    });
    expect(chosen.active).to.equal(false);
  });

  it('should dasherize test names when using metrics', function () {
    var chosen = new Test('my-dasherized-test-name', {
      foo: { weight: 1 },
    });
    expect('myDasherizedTestName' in window.dataLayer[0].abTests).to.equal(true);
  });
});

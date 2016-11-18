var expect = chai.expect;

var utils = {
  roughlyEqual: function(a, b, range) {
    return Math.abs(a-b) < (range || 3);
  }
};

beforeEach(function beforEachTest() {
  window.dataLayer = [];
  localStorage.clear();
  document.body.className = '';
});

describe('Study', function() {

  it('should create an AB test', function() {

    var name = 'test-1';
    var didChoose = false;

    var test = new Study();
    test.define({
      name: name,
      buckets: {
        foo: {
          weight: 1,
        },
      },
    });
    test.assign();
    var info = test.assignments();

    expect(info[name]).to.equal('foo');
    expect(document.body.classList.contains(name+'--foo')).to.equal(true);
  });

  it('should create multiple AB tests', function() {
    var test = new Study();
    test.define([
      {
        name: 'test-multi-1',
        buckets: {
          foo: { weight: 1 },
        },
      }, {
        name: 'test-multi-2',
        buckets: {
          bar: { weight: 1 },
        },
      }
    ]);
    test.assign();
    var info = test.assignments();

    expect(info['test-multi-1']).to.equal('foo');
    expect(info['test-multi-2']).to.equal('bar');
    expect(document.body.classList.contains('test-multi-1--foo')).to.equal(true);
    expect(document.body.classList.contains('test-multi-2--bar')).to.equal(true);
  });

  it('should assign a bucket to a particular AB test', function() {
    var test = new Study();
    test.define([
      {
        name: 'test-multi-3',
        buckets: {
          foo: { weight: 1 },
        },
      }, {
        name: 'test-multi-4',
        buckets: {
          bar: { weight: 1 },
        },
      }, {
        name: 'test-multi-5',
        buckets: {
          baz: { weight: 1 },
        },
      }
    ]);
    test.assign('test-multi-4');
    var info = test.assignments();

    expect(Object.keys(info).length).to.equal(1);
    expect(info['test-multi-4']).to.equal('bar');
    expect(document.body.classList.contains('test-multi-4--bar')).to.equal(true);
  });

  it('should assign a particular bucket to a particular AB test', function() {
    var test = new Study();
    test.define([
      {
        name: 'test-multi-6',
        buckets: {
          foo: { weight: 4 },
          bar: { weight: 0 },
          baz: { weight: 9 },
        },
      }
    ]);
    test.assign('test-multi-6', 'bar');
    var info = test.assignments();

    expect(Object.keys(info).length).to.equal(1);
    expect(info['test-multi-6']).to.equal('bar');
    expect(document.body.classList.contains('test-multi-6--bar')).to.equal(true);
  });

  it('should assign a bucket to a particular AB test with prior assignations', function() {
    var test = new Study();
    test.define([
      {
        name: 'test-multi-7',
        buckets: {
          a: { weight: 1 },
          b: { weight: 0 },
        },
      }, {
        name: 'test-multi-8',
        buckets: {
          c: { weight: 1 },
          d: { weight: 0 },
        },
      }, {
        name: 'test-multi-9',
        buckets: {
          e: { weight: 1 },
          f: { weight: 0 },
        },
      }
    ]);
    test.assign();
    var info = test.assignments();

    expect(Object.keys(info).length).to.equal(3);
    expect(info['test-multi-8']).to.equal('c');

    test.assign('test-multi-8', 'd');
    var info = test.assignments();

    expect(Object.keys(info).length).to.equal(3);
    expect(info['test-multi-8']).to.equal('d');
  });

  it('should assign a bucket to a test, then remove it', function() {
    var test = new Study();
    test.define([
      {
        name: 'test-to-remove-bucket-for',
        buckets: { foo: { weight: 1 } },
      }
    ]);
    test.assign();
    var info = test.assignments();
    console.log('originalInfo', info);
    expect(info['test-to-remove-bucket-for']).to.equal('foo');
    expect(document.body.classList.contains('test-to-remove-bucket-for--foo')).to.equal(true);

    test.assign('test-to-remove-bucket-for', null);

    var updatedInfo = test.assignments();
    console.log('updatedInfo', updatedInfo);
    expect(updatedInfo['test-to-remove-bucket-for']).to.equal(undefined);
    expect(document.body.classList.contains('test-to-remove-bucket-for--foo')).to.equal(false);
  });

  it('should create an AB test with metadata', function() {
    var test = new Study();
    test.define({
      name: 'my-test',
      buckets: {
        foo: { weight: 1, hello: 'world', brian: 'sucks' },
      },
    });

    test.assign();
    var defs = test.definitions();
    var buckets = test.assignments();
    var bucket = buckets['my-test'];

    expect(defs.buckets[bucket].hello).to.equal("world");
    expect(defs.buckets[bucket].brian).to.equal("sucks");
  });

  it('should create a persistent AB test', function() {

    var passes = 10000;
    var buckets = {
      foo: { weight: 5 },
      bar: { weight: 5 }
    };

    var selected = {};
    for(var i = 0; i < passes; i++) {

      var test = new Study();
      test.define({
        name: 'test-2',
        buckets: buckets,
      });
      test.assign();
      var buckets = test.assignments();
      var bucket = buckets['test-2'];

      if(!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    var keys = Object.keys(selected);
    expect(selected[keys[0]]).to.equal(passes);
  });



  it('should create an equally weighted AB test', function() {

    var passes = 10000;

    var selected = {};
    for(var i = 0; i < passes; i++) {

      var test = new Study({
        store: {
          get: () => {},
          set: () => {},
        }
      });

      test.define({
        name: 'test-3',
        buckets: {
          foo: { weight: 1 },
          bar: { weight: 1 }
        },
      });

      test.assign();
      var buckets = test.assignments();
      var bucket = buckets['test-3'];

      if(!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo/passes)*100, 50)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar/passes)*100, 50)).to.equal(true);
  });

  it('should create an unequally weighted AB test', function() {

    var passes = 10000;

    var selected = {};
    for(var i = 0; i < passes; i++) {

      var test = new Study({
        store: {
          get: () => {},
          set: () => {},
        }
      });

      test.define({
        name: 'test-4',
        buckets: {
          foo: { weight: 3 },
          bar: { weight: 1 }
        }
      });

      test.assign();
      var buckets = test.assignments();
      var bucket = buckets['test-4'];

      if(!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo/passes)*100, 75)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar/passes)*100, 25)).to.equal(true);
  });

  it('should create an unequally weighted ABCD test', function () {

    var passes = 10000;

    var selected = {};
    for(var i = 0; i < passes; i++) {

      var test = new Study({
        store: {
          get: () => {},
          set: () => {},
        }
      });

      test.define({
        name: 'test-5',
        buckets: {
          foo: { weight: 3 },
          bar: { weight: 5 },
          baz: { weight: 2 },
          wat: { weight: 8 }
        }
      });

      test.assign();
      var buckets = test.assignments();
      var bucket = buckets['test-5'];

      if(!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo/passes)*100, 16)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar/passes)*100, 27)).to.equal(true);
    expect(utils.roughlyEqual((selected.baz/passes)*100, 11)).to.equal(true);
    expect(utils.roughlyEqual((selected.wat/passes)*100, 44)).to.equal(true);
  });

  it('should create a test with 0% weighted buckets', function () {

    var passes = 10;

    var selected = {};
    for(var i = 0; i < passes; i++) {

      var test = new Study({
        store: {
          get: () => {},
          set: () => {},
        }
      });

      test.define({
        name: 'test-6',
        buckets: {
          foo: { weight: 0 },
          bar: { weight: 0 },
          baz: { weight: 1 },
        }
      });

      test.assign();
      var buckets = test.assignments();
      var bucket = buckets['test-6'];

      if(!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(selected.foo).to.be.undefined;
    expect(selected.bar).to.be.undefined;
    expect(selected.baz).to.equal(passes);
  });

  it('should persist data in the local store', function () {
    const uid = Math.random();
    Study.stores.local.set('test', uid);
    expect(  Study.stores.local.get('test')).to.equal(uid.toString());
  });
  it('should persist data in the browserCookie store', function () {
    const uid = Math.random();
    Study.stores.browserCookie.set('test', uid);
    expect(  Study.stores.browserCookie.get('test')).to.equal(uid.toString());
  });
  it('should persist data in the memory store', function () {
    const uid = Math.random();
    Study.stores.memory.set('test', uid);
    expect(  Study.stores.memory.get('test')).to.equal(uid);
  });
});

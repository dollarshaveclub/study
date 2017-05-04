const expect = chai.expect;

const utils = {
  roughlyEqual(a, b, range) {
    return Math.abs(a - b) < (range || 3);
  },
};

beforeEach(() => {
  window.dataLayer = [];
  localStorage.clear();
  document.body.className = '';
});

describe('Study', () => {
  it('should create an AB test', () => {
    const name = 'test-1';
    const didChoose = false;

    const test = new Study();
    test.define({
      name,
      buckets: {
        foo: {
          weight: 1,
        },
      },
    });
    test.assign();
    const info = test.assignments();

    expect(info[name]).to.equal('foo');
    expect(document.body.classList.contains(`${name}--foo`)).to.equal(true);
  });

  it('should create multiple AB tests', () => {
    const test = new Study();
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
      },
    ]);
    test.assign();
    const info = test.assignments();

    expect(info['test-multi-1']).to.equal('foo');
    expect(info['test-multi-2']).to.equal('bar');
    expect(document.body.classList.contains('test-multi-1--foo')).to.equal(true);
    expect(document.body.classList.contains('test-multi-2--bar')).to.equal(true);
  });

  it('should assign a bucket to a particular AB test', () => {
    const test = new Study();
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
      },
    ]);
    test.assign('test-multi-4');
    const info = test.assignments();

    expect(Object.keys(info).length).to.equal(1);
    expect(info['test-multi-4']).to.equal('bar');
    expect(document.body.classList.contains('test-multi-4--bar')).to.equal(true);
  });

  it('should assign a particular bucket to a particular AB test', () => {
    const test = new Study();
    test.define([
      {
        name: 'test-multi-6',
        buckets: {
          foo: { weight: 4 },
          bar: { weight: 0 },
          baz: { weight: 9 },
        },
      },
    ]);
    test.assign('test-multi-6', 'bar');
    const info = test.assignments();

    expect(Object.keys(info).length).to.equal(1);
    expect(info['test-multi-6']).to.equal('bar');
    expect(document.body.classList.contains('test-multi-6--bar')).to.equal(true);
  });

  it('should assign a bucket to a particular AB test with prior assignations', () => {
    const test = new Study();
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
      },
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

  it('should assign a bucket to a test, then remove it', () => {
    const test = new Study();
    test.define([
      {
        name: 'test-to-remove-bucket-for',
        buckets: { foo: { weight: 1 } },
      },
    ]);
    test.assign();
    const info = test.assignments();
    expect(info['test-to-remove-bucket-for']).to.equal('foo');
    expect(document.body.classList.contains('test-to-remove-bucket-for--foo')).to.equal(true);

    test.assign('test-to-remove-bucket-for', null);

    const updatedInfo = test.assignments();
    expect(updatedInfo['test-to-remove-bucket-for']).to.equal(undefined);
    expect(document.body.classList.contains('test-to-remove-bucket-for--foo')).to.equal(false);
  });

  it('should create an AB test with metadata', () => {
    const test = new Study();
    test.define({
      name: 'my-test',
      buckets: {
        foo: { weight: 1, hello: 'world', brian: 'sucks' },
      },
    });

    test.assign();
    const defs = test.definitions();
    const buckets = test.assignments();
    const bucket = buckets['my-test'];

    expect(defs.buckets[bucket].hello).to.equal('world');
    expect(defs.buckets[bucket].brian).to.equal('sucks');
  });

  it('should create a persistent AB test', () => {
    const passes = 10000;
    var buckets = {
      foo: { weight: 5 },
      bar: { weight: 5 },
    };

    const selected = {};
    for (let i = 0; i < passes; i++) {
      const test = new Study();
      test.define({
        name: 'test-2',
        buckets,
      });
      test.assign();
      var buckets = test.assignments();
      const bucket = buckets['test-2'];

      if (!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    const keys = Object.keys(selected);
    expect(selected[keys[0]]).to.equal(passes);
  });


  it('should create an equally weighted AB test', () => {
    const passes = 10000;

    const selected = {};
    for (let i = 0; i < passes; i++) {
      const test = new Study({
        store: {
          get: () => {},
          set: () => {},
          isSupported: () => true,
        },
      });

      test.define({
        name: 'test-3',
        buckets: {
          foo: { weight: 1 },
          bar: { weight: 1 },
        },
      });

      test.assign();
      const buckets = test.assignments();
      const bucket = buckets['test-3'];

      if (!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo / passes) * 100, 50)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar / passes) * 100, 50)).to.equal(true);
  });

  it('should create an unequally weighted AB test', () => {
    const passes = 10000;

    const selected = {};
    for (let i = 0; i < passes; i++) {
      const test = new Study({
        store: {
          get: () => {},
          set: () => {},
          isSupported: () => true,
        },
      });

      test.define({
        name: 'test-4',
        buckets: {
          foo: { weight: 3 },
          bar: { weight: 1 },
        },
      });

      test.assign();
      const buckets = test.assignments();
      const bucket = buckets['test-4'];

      if (!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo / passes) * 100, 75)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar / passes) * 100, 25)).to.equal(true);
  });

  it('should create an unequally weighted ABCD test', () => {
    const passes = 10000;

    const selected = {};
    for (let i = 0; i < passes; i++) {
      const test = new Study({
        store: {
          get: () => {},
          set: () => {},
          isSupported: () => true,
        },
      });

      test.define({
        name: 'test-5',
        buckets: {
          foo: { weight: 3 },
          bar: { weight: 5 },
          baz: { weight: 2 },
          wat: { weight: 8 },
        },
      });

      test.assign();
      const buckets = test.assignments();
      const bucket = buckets['test-5'];

      if (!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(utils.roughlyEqual((selected.foo / passes) * 100, 16)).to.equal(true);
    expect(utils.roughlyEqual((selected.bar / passes) * 100, 27)).to.equal(true);
    expect(utils.roughlyEqual((selected.baz / passes) * 100, 11)).to.equal(true);
    expect(utils.roughlyEqual((selected.wat / passes) * 100, 44)).to.equal(true);
  });

  it('should create a test with 0% weighted buckets', () => {
    const passes = 10;

    const selected = {};
    for (let i = 0; i < passes; i++) {
      const test = new Study({
        store: {
          get: () => {},
          set: () => {},
          isSupported: () => true,
        },
      });

      test.define({
        name: 'test-6',
        buckets: {
          foo: { weight: 0 },
          bar: { weight: 0 },
          baz: { weight: 1 },
        },
      });

      test.assign();
      const buckets = test.assignments();
      const bucket = buckets['test-6'];

      if (!selected[bucket]) {
        selected[bucket] = 0;
      }
      selected[bucket]++;
    }

    expect(selected.foo).to.be.undefined;
    expect(selected.bar).to.be.undefined;
    expect(selected.baz).to.equal(passes);
  });

  it('should persist data in the local store', () => {
    const uid = Math.random();
    Study.stores.local.set('test', uid);
    expect(Study.stores.local.get('test')).to.equal(uid.toString());
  });
  it('should persist data in the browserCookie store', () => {
    const uid = Math.random();
    Study.stores.browserCookie.set('test', uid);
    expect(Study.stores.browserCookie.get('test')).to.equal(uid.toString());
  });
  it('should persist data in the memory store', () => {
    const uid = Math.random();
    Study.stores.memory.set('test', uid);
    expect(Study.stores.memory.get('test')).to.equal(uid);
  });

  it('should fall back to memory store if local store isnt supported', () => {
    Study.stores.local.isSupported = function () { return false; };
    const test = new Study({
      store: Study.stores.local,
    });
    expect(test.store.type).to.equal('memory');
  });
});

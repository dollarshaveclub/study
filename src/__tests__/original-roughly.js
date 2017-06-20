
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';

import MemoryStore from '../stores/memory';
import Study from '../study';

const utils = {
  roughlyEqual(a, b, range) {
    return Math.abs(a - b) < (range || 3);
  },
};

it('should create a persistent AB test', () => {
  const passes = 10000;
  const buckets = {
    foo: { weight: 5 },
    bar: { weight: 5 },
  };

  const store = MemoryStore();
  const selected = {};
  for (let i = 0; i < passes; i++) {
    const test = new Study({ store });
    test.define({
      name: 'test-2',
      buckets,
    });
    test.assign();
    const buckets2 = test.assignments();
    const bucket = buckets2['test-2'];

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

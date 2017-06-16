
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';

import MemoryStore from '../stores/memory';
import Study from '../study';

it('should create an AB test', () => {
  const name = 'test-1';

  const test = new Study({ store: MemoryStore() });
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
  const test = new Study({ store: MemoryStore() });

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
  const test = new Study({ store: MemoryStore() });

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
  const test = new Study({ store: MemoryStore() });
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
  const test = new Study({ store: MemoryStore() });
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
  let info = test.assignments();

  expect(Object.keys(info).length).to.equal(3);
  expect(info['test-multi-8']).to.equal('c');

  test.assign('test-multi-8', 'd');
  info = test.assignments();

  expect(Object.keys(info).length).to.equal(3);
  expect(info['test-multi-8']).to.equal('d');
});

it('should assign a bucket to a test, then remove it', () => {
  const test = new Study({ store: MemoryStore() });
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


import assert from 'assert'

import MemoryStore from '../stores/memory'
import Study from '../study'

it('should keep the same buckets if .assign() is ran twice', () => {
  const test = new Study({ store: MemoryStore() })
  test.define([
    {
      name: '1',
      buckets: {
        a: {
          weight: 1,
          default: true,
        },
        b: {
          weight: 1,
        },
        c: {
          weight: 1,
        },
      },
    },
  ])
  test.assign()

  const buckets = test.definitions()

  for (let i = 0; i < 100; i++) {
    test.assign()
    assert.deepEqual(buckets, test.definitions())
  }
})

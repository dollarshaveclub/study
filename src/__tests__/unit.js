
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

// https://github.com/dollarshaveclub/study/issues/27
it('should randomly assign when doing .assign()', () => {
  // Set up our test API
  const test = new Study({ store: MemoryStore() })

  // Define a test
  test.define({
    name: 'new-homepage',
    buckets: {
      control: { weight: 0.6 },
      versionA: { weight: 0.2 },
      versionB: { weight: 0.2 },
    }
  })

  const buckets = {
    control: 0,
    versionA: 0,
    versionB: 0
  }

  // Bucket the user
  for (let i = 0; i < 1000; i++) {
    test.assign('new-homepage')
    const assignment = test.assignments()['new-homepage']
    buckets[assignment]++
  }

  assert(buckets.control)
  assert(buckets.versionA)
  assert(buckets.versionB)
})

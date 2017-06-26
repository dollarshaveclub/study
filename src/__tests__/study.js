
import assert from 'assert'

import MemoryStore from '../stores/memory'
import Study from '../study'

function createTestName () {
  return `ab-test-${Math.random().toString(36).slice(2)}`
}

it('should always bucket an inactive test to the default', () => {
  const name = createTestName()

  let i = 0
  while (i++ < 100) {
    const test = new Study({ store: MemoryStore() })
    test.define([
      {
        name,
        active: false,
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
          d: {
            weight: 1,
          },
        },
      },
    ])
    test.assign()
    assert.equal('a', test.assignments()[name])
  }
})

it('should always bucket to the winning test', () => {
  const store = MemoryStore()
  const name = createTestName()

  const defaultTests = [
    {
      name,
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
        d: {
          weight: 1,
        },
      },
    },
  ]

  let test = new Study({ store })
  test.define(defaultTests)
  test.assign()
  test.assign(name, 'b')

  assert.equal('b', test.assignments()[name])

  defaultTests[0].buckets.a.winner = true
  test = new Study({ store })
  test.define(defaultTests)
  test.assign()
  assert.equal('a', test.assignments()[name])
})


export const rand = (min, max) => (Math.random() * (max - min)) + min

// choose a random value with the specified weights
export const chooseWeightedItem = (names, weights) => {
  if (names.length !== weights.length) throw new Error('names and weights must have equal length!')
  const sum = weights.reduce((a, b) => a + b, 0)
  let limit = 0
  const n = rand(0, sum)
  for (let i = 0; i < names.length; i++) {
    limit += weights[i]
    if (n <= limit) return names[i]
  }
  // by default, return the last weight
  return names[names.length - 1]
}

// get the default bucket,
// which is either the default/winner,
// otherwise whichever is returned first
export const getDefaultBucket = (buckets) => {
  const defaultBuckets = Object.keys(buckets).filter((name) => {
    const x = buckets[name]
    return x.default || x.winner
  })
  return defaultBuckets[0] || Object.keys(buckets)[0]
}

export const validateStore = (store) => {
  if (!store) throw new Error('You must supply a store!')
  if (typeof store.get !== 'function') throw new Error('The store must implement .get()')
  if (typeof store.set !== 'function') throw new Error('The store must implement .set()')
  if (typeof store.isSupported !== 'function') throw new Error('The store must implement .isSupported()')
  if (!store.isSupported()) throw new Error('The store is not supported.')
}


export const rand = (min, max) => (Math.random() * (max - min)) + min;

export const chooseWeightedItem = (names, weights) => {
  const sum = weights.reduce((a, b) => a + b);
  let limit = 0;
  const n = rand(0, sum);
  for (let i = 0; i < names.length; i += 1) {
    limit += weights[i];
    if (n <= limit) return names[i];
  }
  return '';
};

export const getDefaultBucket = (buckets) => {
  const defaultBuckets = Object.keys(buckets).filter((name) => {
    const x = buckets[name];
    return x.default || x.winner;
  });
  return defaultBuckets[0] || Object.keys(buckets)[0];
};

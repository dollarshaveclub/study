
export default () => {
  const store = Object.create(null)

  return {
    type: 'memory',
    get: key => store[key],
    set: (key, val) => {
      store[key] = val
    },
    isSupported: () => true,
  }
}

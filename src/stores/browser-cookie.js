
// NOTE: use a module
export default () => ({
  type: 'browserCookie',
  /*eslint-disable */
  get: key => decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null,
  set: (key, val) => {
    const expirationDate = new Date('12/31/9999').toUTCString()
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(val)}; expires=${expirationDate}; path=/`
  },
  /*eslint-enable */
  isSupported: () => typeof document !== 'undefined',
})

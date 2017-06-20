
// NOTE: use a module
export default () => ({
  type: 'browserCookie',
  /*eslint-disable */
  get: key => decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null,
  set: (key, val) => document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(val)}; expires=expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`,
  /*eslint-enable */
  isSupported: () => typeof document !== 'undefined',
});

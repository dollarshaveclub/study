
export default () => ({
  type: 'local',
  get: key => localStorage.getItem(key),
  set: (key, val) => localStorage.setItem(key, val),
  isSupported: () => {
    if (typeof localStorage !== 'undefined') return true;
    const uid = new Date();
    try {
      localStorage.setItem(uid, uid);
      localStorage.removeItem(uid);
      return true;
    } catch (e) {
      return false;
    }
  },
});

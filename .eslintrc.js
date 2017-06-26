module.exports = {
  extends: [
    'dollarshaveclub'
  ],
  env: {
    browser: true,
  },
  globals: {
    Ember: true,
    Fingerprint: true,
    Flickity: true,
    Modernizr: false,
    Raven: true,
    branch: true
  },
  rules: {
    'handle-callback-err': 0,
    'no-mixed-operators': 0,
    'prefer-promise-reject-errors': 0,
  }
};

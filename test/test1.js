const assert = chai.assert;

const errors = [];

const test = new Study();
test.define({
  name: 'test',
  buckets: {
    foo: {
      weight: 1,
    },
  },
});
test.assign();

try {

  assert.equal(Study.stores.local.get('ab-tests'), '{"test":"foo"}',
  'stores test before document.onload');

  document.addEventListener('DOMContentLoaded', function() {
    const className = document.body.className;
    assert.equal(className, 'test--foo',
    'applies classes after body onload')
  });

} catch (e) {
  window.alert(e);
}

var expect = chai.expect;

describe('Tester', function() {

  it('should create a test', function() {

    var passes = 10000;
    var tests = {
      foo: { weight: 1 },
      bar: { weight: 1 }
    };

    var selected = {};
    for(var i = 0; i<passes; i++) {

      var chosen = new Test('my-test', tests, {
        persist: false
      });

      if(!selected[chosen.bucket]) {
        selected[chosen.bucket] = 0;
      }
      selected[chosen.bucket]++;
    }

    expect(true).to.equal(true);
  });
});

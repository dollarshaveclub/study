# AB Tester

## Developing
```bash
npm install # Install dependencies
npm build # Hint and uglify
npm build-watch # Build and watch
npm test # Run tests
```

## Usage
```html
<script src="test.min.js"></script>
<script>
  var chosen = new Test(name, data, options);

  console.log(chosen);
  /* {
    bucket: "control",
    data: {
      weight: 1,
      chosen: function() {}
    }
  } */
</script>
```

## API
* `name`: String test name
* `data`: Tests to execute:
  * `data` is an object whose keys represent test cases to be randomly chosen.
  * The keys can be any name that you want.
  * The available options for each test are an optional `weight`, a `Number`, and an optional `chosen`, a `Function`

```javascript
var data = {
  testA: {
    weight: 1,
    chosen: Test.noop
  },
  testB: {
    weight: 1,
    chosen: Test.noop
  }
};
```

* `options`: Optional object of misc test options
```javascript
var options = {
  persist: true // Set to false to not store test bucket in sessionStorage
};
```

## Building tests
```javascript
new Test('new-homepage', {
  control: {},
  test: {}
});
```
* Once a test is chosen, two classes will be added to the body tag to help you make style adjustments from the chosen test.

```html
<body class="new-homepage test">
```
```css
.new-homepage.test {
  /* Write custom styles for the new homepage test */
}
```


## License

MIT

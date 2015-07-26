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

  chosen == {
    bucket: "control",
    data: {
      weight: 1,
      chosen: function() {}
    }
  }
</script>
```

## Options
* `name`: Test name (String)
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
}, {
  persist: false
});
```
* Once a test is chosen, two classes will be added to the body tag to help you make style adjustments for the chosen test.

```html
<body class="new-homepage test"> <!-- Could be new-homepage.control -->
```
```css
.new-homepage.test {
  /* Write custom styles for the new homepage test */
}
```


## License

**MIT Licensing**

Copyright (c) 2015 Dollar Shave Club

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

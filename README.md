<a href="https://github.com/dollarshaveclub/study">
  <img src="https://dollarshaveclub.github.io/study/assets/study-v2.svg">
</a>

> A progressive, client/server AB testing library.

[![npm][npm-image]][npm-url]
[![bower][bower-image]][bower-url]
[![Build Status](https://travis-ci.org/dollarshaveclub/study.svg?branch=master)](https://travis-ci.org/dollarshaveclub/postmate)
[![Share](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](#)

[npm-image]: https://badge.fury.io/js/studyjs.svg
[npm-url]: https://www.npmjs.com/package/studyjs
[bower-image]: https://badge.fury.io/bo/study.svg
[bower-url]: https://github.com/dollarshaveclub/study

Study is an AB testing library designed to be clear, minimal, and flexible. It works in both the server and browser with the use of driver-based persistence layers.

You can download the compiled javascript directly [here](/build/study.min.js)

* [Features](#features)
* [Installing](#installing)
* [Usage](#usage)
* [API](#api)
* [Guide/FAQ](#guidefaq)
* [License](#license)

***

## Features
* Powerful, clear API
* Many variations. ABCD testing
* Intelligent weighted bucketing
* Browser & Server support
* Storage Drivers: `localStorage`, `cookies`, `memory`, or build your own
* Well documented, tested, and proven in high production environments
* Lightweight, weighing in at ~ <span class="size">`3.4kb`</span>.
* Not tested on animals

## Installing
```bash
# Via NPM
npm i studyjs --save-dev

# Via Bower
bower i studyjs --save-dev

# Via Yarn
yarn add studyjs
```

## Developing
```bash
npm install # Install dependencies
npm build # Hint and uglify
npm build-watch # Build and watch
npm lint # Run linting
npm test # Run tests
```

## Usage
```html
<script src="study.min.js"></script>
<script>

  // Set up our test API
  const test = new Study({
    store: Study.stores.local
  });

  // Define a test
  test.define({
    name: 'new-homepage',
    buckets: {
      control: { weight: 0.6 },
      versionA: { weight: 0.2 },
      versionB: { weight: 0.2 },
    }
  });

  // Bucket the user
  test.assign();

  // Fetch assignments at a later point
  const info = test.assignments();
</script>
```

## API

> ## `Study(config)`

```javascript
const study = new Study({
  debug: true,
  store: Study.stores.local
});
```
> This creates a new test API used to defined tests, assign buckets, and retrieve information.

**Returns**: `Object`

Name | Type | Description | Default
:--- | :--- | :--- | :---
`debug` | `Boolean` | _Set to `true` to enable logging of additional information_ | `false`
`store` | `Object` | _An object with get/set properties that will accept information to help persist and retrieve tests_ | `Study.stores.local`

***

> ## `study.define(testData)`

```javascript
// Create your test API
const study = new Study();

// Define a test
study.define({
  name: 'MyTestName',
  buckets: {
    variantA: { weight: 0.5 },
    variantB: { weight: 0.5 },
  },
});
```
> This function defines the tests to be assigned to used during bucket assignment. This function accepts an object with two keys, `name` and `buckets`. Alternatively, you may pass an array of similar objects to define multiple tests at once.

> The `name` value is the name of your test. The keys within `bucket` are your bucket names. Each bucket value is an object containing an object with an optional key `weight` that defaults to `1`.

> The percent chance a bucket is chosen for any given user is determined by the buckets weight divided by the total amount of all weights provided for an individual test. If you have three buckets with a weight of 2, `2/6 == 0.33` which means each bucket has a weight of `33%`. There is no max for the total weights allowed.

**Returns**: `null`

Name | Type | Description | Default
:--- | :--- | :--- | :---
`data` | `Object/Array` | _An object/array of objects containing test and bucket information_ | `null`

***

> ## `study.assign(testName, bucketName)`

```javascript
const study = new Study();
study.define({
  name: 'new-homepage',
  buckets: {
    variantA: { weight: 0.5 },
    variantB: { weight: 0.5 },
  }
});

// Assign buckets from all tests to the user...
study.assign();

// or assign bucket from the specified test...
study.assign('new-homepage');

// or specify the bucket from the specified test...
study.assign('new-homepage', 'variantB');

// or remove the bucketing assignment from the specified test.
study.assign('new-homepage', null);
```
> Calling the `assign` method will assign a bucket for the provided tests to a user and persist them to the `store`. If a user has already been bucketed, they will _not_ be rebucketed unless a `bucketName` is explicitly provided.

> If no arguments are provided, all tests will have a bucket assigned to the user. If the first argument provided is a test name, it will attempt to assign a bucket for that test to a user. If a `bucketValue` is provided, it will set that user to the specified bucket. If the `bucketValue` is null, it will remove that users assignment to the bucket.

**Returns**: `null`

Name | Type | Description | Default
:--- | :--- | :--- | :---
`testName` (optional) | `String` | _The name of the test to assign a bucket to_ | `null`
`bucketName` (optional) | `String` | _The name of the bucket to assign to a user_ | `null`

***

> ## `study.definitions()`

```javascript
const study = new Study();
study.define({
  name: 'new-homepage',
  buckets: {
    variantA: { weight: 0.5 },
    variantB: { weight: 0.5 },
  }
});

// Retrieve all of the provided tests
const tests = study.definitions();
```
> This provides the user with all of the tests available.

> The returned information will be an array if multiple tests were defined, otherwise, it will be an object of the single test defined. The object will mirror exactly what was provided in the `define` method.

**Returns**: `Object|Array`

***

> ## `study.assignments()`

```javascript
const study = new Study();
study.define({
  name: 'new-homepage',
  buckets: {
    variantA: { weight: 1 },
  }
});

// Capture assignments
study.assign();

// Retrieve all of the bucket assignments for the user
const buckets = study.assignments();
assert.equal(buckets['new-homepage'], 'variantA');
```
> This provides the user with all of the bucket assignments for the current user.

> The returned information will be an object whose keys will be test names and values will be the current bucket assigned to the user.

```javascript
// Example return
{
  'new-homepage': 'variantA',
  'some-test': 'some-bucket',
}
```

**Returns**: `Object|Array`

***

## Guide/FAQ

### CSS Driven Tests
Tests logic may be potentially powered on solely CSS. Upon calling `assign`, if the script is running in the browser, a class per test will be added to the `body` tag with the test name and bucket in `BEM` syntax.
```html
<body class="new-homepage--variantA"> <!-- Could be new-homepage--variantB -->
```
```css
.new-homepage--variantA {
  /* Write custom styles for the new homepage test */
}
```

### Storing metadata associated with tests
Each bucket provided may have additional metadata associated with it, and may have its value retrieved by retrieving the assignments and definitions.
```javascript
const study = new Study();
study.define({
  name: 'new-homepage',
  buckets: {
    variantA: { weight: 1, foo: 'bar' },
  }
});

study.assign();

const defs = study.definitions();
const buckets = study.assignments();
const bucket = buckets['new-homepage'];
const bar = defs.buckets[bucket].foo; // "bar"
```

## License

**MIT Licensing**

Copyright (c) 2015 - 2017 Dollar Shave Club

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

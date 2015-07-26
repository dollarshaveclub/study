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
  var chosen = new Test('my-test', {
    control: {
      weight: 1,
      chosen: function() {}
    },
    test: {
      weight: 1,
      chosen: function() {}
    }
  });

  chosen == {
    bucket: "control",
    data: {
      weight: 1,
      chosen: function() {}
    }
  };

</script>
```
## License

MIT

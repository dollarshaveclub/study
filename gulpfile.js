var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');

var pkg = require('./package.json');

gulp.task('default', function() {
  return gulp.src('index.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }))
    .pipe(uglify())
    .pipe(rename('test.min.js'))
    .pipe(gulp.dest('build'))
});

gulp.task('do-watch', function() {
  gulp.watch('index.js', ['default']);
});

gulp.task('watch', ['default', 'do-watch']);

var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');

var pkg = require('./package.json');

gulp.task('default', function() {
  return gulp.src([
    'lib/test.js',
    'lib/manager.js'
  ])
  .pipe(concat('test.js'))
  .pipe(jshint())
  .pipe(jshint.reporter('default', { verbose: true }))
  .pipe(gulp.dest('build'))
  .pipe(uglify())
  .pipe(rename('test.min.js'))
  .pipe(gulp.dest('build'))
});

gulp.task('do-watch', function() {
  gulp.watch('lib/*.js', ['default']);
});

gulp.task('watch', ['default', 'do-watch']);

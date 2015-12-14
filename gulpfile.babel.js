import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';

gulp.task('default', () => {
  var bundler = browserify('./index.js', {
    standalone: 'Test'
  });
  bundler.transform(babelify);
  bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('test.min.js'))
    .pipe(buffer())
    .pipe(gulp.dest('build'));
});

gulp.task('do-watch', () => {
  gulp.watch('lib/**/*.js', ['default']);
});


gulp.task('watch', ['default', 'do-watch']);

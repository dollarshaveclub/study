import babelify from 'babelify';
import bookmarklet from 'bookmarklet';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import fs from 'fs';
import gulp from 'gulp';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';

gulp.task('default', () => {

  browserify('./index.js', { standalone: 'Test' })
    .transform(babelify)
    .bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('test.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));

  browserify('./interface.js', { standalone: 'TestInterface' })
    .transform(babelify)
    .bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('test-interface.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build'));

});

gulp.task('do-watch', () => {
  gulp.watch('lib/**/*.js', ['default', 'bookmarklet']);
});

gulp.task("bookmarklet", cb => {
  var html = fs.readFileSync('./bookmarklet/index.html', 'utf-8');
  var escaped = bookmarklet.convert('', {
    script: ['http://dollarshaveclub.github.io/ab-tester.js/build/test-interface.min.js']
  });

  fs.writeFile(
    './build/bookmarklet.html',
    html.replace('_BOOKMARKLET_', escaped),
    cb
  );
});

gulp.task('watch', ['default', 'bookmarklet', 'do-watch']);

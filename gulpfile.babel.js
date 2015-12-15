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

    .pipe(function () {
      console.log(arguments);
    })

    .pipe(gulp.dest('build'));

});

gulp.task('do-watch', () => {
  gulp.watch('lib/**/*.js', ['default']);
});

gulp.task("bookmarklet", cb => {
  var data = fs.readFileSync('./build/test-interface.min.js', 'utf-8');
  var code = bookmarklet.convert(data, {

  });

  var readme = fs.readFileSync('./assets/README.md', 'utf-8');
  readme = readme.replace('_BOOKMARKLET_', code);
  fs.writeFile('./README.md', readme, cb);
});

gulp.task('watch', ['default', 'do-watch']);

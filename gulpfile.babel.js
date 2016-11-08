const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const header = require('gulp-header');
const path = require('path');
const rename = require('gulp-rename');

const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const uglify = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');
const minify = require('uglify-js').minify;

const pkg = require('./package.json');

const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author %>',
  ' * @license <%= pkg.license %> */',
  ''].join('\n');

gulp.task('do-build', () =>
  rollup({
    entry: './src/study.js',
    format: 'umd',
    moduleName: 'Study',
    plugins: [
      babel({
        exclude: 'node_modules/**',
      }),
      uglify({}, minify),
    ],
  })
    .pipe(source('study.min.js'))
    .pipe(header(banner, { pkg }))
    .pipe(gulp.dest('./build'))
  // gulp.src('./src/study.js')
  //   .pipe(babel())
  //   .pipe(rename('study.js'))
  //   .pipe(gulp.dest('./build'))
  //   .pipe(uglify())
  //   .pipe(header(banner, { pkg }))
  //   .pipe(rename('study.min.js'))
  //   .pipe(gulp.dest('./build'))
);

gulp.task('update-readme', ['do-build'], () => {
  const readme = path.join(__dirname, 'README.md');
  const data = fs.readFileSync(readme, 'utf-8');
  const distSize = fs.statSync(path.join(__dirname, 'build', 'study.min.js')).size;
  const updated = data.replace(/<span class="size">(.*?)<\/span>/,
    `<span class="size">\`${(distSize / 1024).toFixed(1)}kb\`</span>`);
  fs.writeFileSync(readme, updated);
});

gulp.task('lint', () =>
  true
  // gulp.src(['**/*.js', '!node_modules/**', '!build/**'])
  //   .pipe(eslint())
  //   .pipe(eslint.format())
  //   .pipe(eslint.failAfterError())
);

gulp.task('do-watch', () => {
  gulp.watch('src/**/*.js', ['build']);
});

gulp.task('build', ['lint', 'do-build', 'update-readme']);
gulp.task('build-watch', ['build', 'do-watch']);

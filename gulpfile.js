/* jshint node: true */
(function() {
  'use strict';

  var gulp = require('gulp');

  var paths = {
    src: {
      css: [
        'src/assets/stylesheets/lib/foundation.css',
        'node_modules/pikaday/css/pikaday.css'
      ],
      scss: [
        'src/assets/stylesheets/calcentral.scss'
      ],
      fonts: 'src/fonts/**/*.*',
      img: 'src/img/**/*.*',
      js: ['src/js/lib-base/**/*.js', 'src/js/lib/**/*.js', 'src/js/**/*.js'],
      html: 'src/index.html'
    },
    build: {
      css: 'public/**/*.css',
      js: 'public/**/*.js',
      main: 'public'
    }
  };

  gulp.task('images', function() {
    var imagemin = require('gulp-imagemin');
    var pngcrush = require('imagemin-pngcrush');
    return gulp.src(paths.src.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngcrush()]
    }))
    .pipe(gulp.dest('public/img'));
  });

  /**
   * CSS Task
   */
  gulp.task('css', function() {
    // Automatically add browser prefixes (e.g. -webkit) when necessary
    var autoprefixer = require('gulp-autoprefixer');
    // Concatenate the files
    var concat = require('gulp-concat');
    // Convert the .scss files into .css
    var sass = require('gulp-sass');
    // We need the to combine the CSS and SCSS streams
    var streamqueue = require('streamqueue');

    return streamqueue({
        objectMode: true
      },
      gulp.src(paths.src.css),
      gulp.src(paths.src.scss)
        .pipe(sass())
        .pipe(autoprefixer({
          cascade: false
        })
      )
    )
    // Combine the files
    .pipe(concat('application.css'))
    // Output to the correct directory
    .pipe(gulp.dest('public/assets/css'));
  });

  gulp.task('fonts', function() {
    return gulp.src(paths.src.fonts)
      .pipe(gulp.dest('public/fonts'));
  });

  gulp.task('js', function() {
    var uglify = require('gulp-uglify');
    var concat = require('gulp-concat');

    return gulp.src(paths.src.js)
      .pipe(uglify())
      .pipe(concat('app.js'))
      .pipe(gulp.dest('public/js'));
  });

  gulp.task('index', ['images', 'js', 'css', 'fonts'], function() {
    var inject = require('gulp-inject');
    var target = gulp.src('./src/index.html');
    var sources = gulp.src([paths.build.js, paths.build.css], {
      read: false
    });

    return target
    .pipe(inject(sources, {
      addRootSlash: false,
      ignorePath: 'public'
    }))
    .pipe(gulp.dest('public'));
  });

  gulp.task('build-clean', function(cb) {
    var del = require('del');
    del([
      'public/'
    ], cb);
  });

  gulp.task('build', ['images', 'js', 'css', 'fonts', 'index', 'browser-sync']);

  // gulp.task('default', ['build'], function() {
  //   gulp.watch(paths.src.html, ['index', browserSync.reload]);
  //   gulp.watch(paths.src.css, ['css']);
  //   gulp.watch(paths.src.fonts, ['fonts', browserSync.reload]);
  //   gulp.watch(paths.src.js, ['js', browserSync.reload]);
  //   gulp.watch(paths.src.img, ['images', browserSync.reload]);
  // });
})();

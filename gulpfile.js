/* jshint node:true */
(function() {
  'use strict';

  var gulp = require('gulp');

  var paths = {
    src: {
      css: [
        // CSS Framework
        'src/assets/stylesheets/lib/foundation.css',
        // Font Awesome
        'node_modules/font-awesome/css/font-awesome.css',
        // Datepicker
        'node_modules/pikaday/css/pikaday.css'
      ],
      scss: [
        // Main CSS File
        'src/assets/stylesheets/calcentral.scss'
      ],
      fonts: [
        'node_modules/font-awesome/fonts/**/*.*'
      ],
      img: 'src/assets/images/**/*.*',
      js: [
        // Date parsing
        'node_modules/moment/moment.js',
        // Libraries (google analytics)
        'src/assets/javascripts/lib/**/*.js',
        // Human Sorting in JavaScript
        'node_modules/js-natural-sort/naturalSort.js',
        // Remote JavaScript error logging
        // TODO - update to official version when
        //  https://github.com/getsentry/raven-js/issues/197 is resolved
        'node_modules/raven-js-temp/dist/raven.js',
        // Datepicker
        'node_modules/pikaday/pikaday.js',
        // Angular
        'node_modules/angular/angular.js',
        // Angular Routing
        'node_modules/angular-route/angular-route.js',
        // Angular Sanitize (avoid XSS exploits)
        'node_modules/angular-sanitize/angular-sanitize.js',
        // Angular Swipe Directive
        // TODO - remove as soon as
        //  https://github.com/angular/angular.js/issues/4030 is fixed
        'src/assets/javascripts/angularlib/swipeDirective.js',
        // All the other files
        'src/assets/javascripts/**/*.js'
      ],
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
        svgoPlugins: [{
          removeViewBox: false
        }],
        use: [
          pngcrush()
        ]
      }))
      .pipe(gulp.dest('public/assets/images'));
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
    .pipe(gulp.dest('public/assets/stylesheets'));
  });

  gulp.task('fonts', function() {
    return gulp.src(paths.src.fonts)
      .pipe(gulp.dest('public/assets/fonts'));
  });

  gulp.task('js', function() {
    var concat = require('gulp-concat');
    var ngAnnotate = require('gulp-ng-annotate');
    var uglify = require('gulp-uglify');

    return gulp.src(paths.src.js)
      .pipe(ngAnnotate({
        single_quotes: true
      }))
      // .pipe(uglify())
      .pipe(concat('application.js'))
      .pipe(gulp.dest('public/assets/javascripts'));
  });

  gulp.task('index', ['images', 'js', 'css', 'fonts'], function() {
    var inject = require('gulp-inject');
    var sources = gulp.src([paths.build.js, paths.build.css], {
      read: false
    });

    return gulp.src(paths.src.html)
    // .pipe(inject(sources, {
    //   addRootSlash: false,
    //   ignorePath: 'public'
    // }))
    .pipe(gulp.dest('public'));
  });

  gulp.task('build-clean', function(cb) {
    var del = require('del');
    del([
      'public/assets/',
      'public/index.html'
    ], cb);
  });

  gulp.task('build', ['build-clean', 'images', 'js', 'css', 'fonts', 'index']);
  //gulp.task('build', ['images', 'js', 'css', 'fonts', 'index', 'browser-sync']);

  // gulp.task('default', ['build'], function() {
  //   gulp.watch(paths.src.html, ['index', browserSync.reload]);
  //   gulp.watch(paths.src.css, ['css']);
  //   gulp.watch(paths.src.fonts, ['fonts', browserSync.reload]);
  //   gulp.watch(paths.src.js, ['js', browserSync.reload]);
  //   gulp.watch(paths.src.img, ['images', browserSync.reload]);
  // });
})();

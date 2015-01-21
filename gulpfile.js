/* jshint node:true */
(function() {
  'use strict';

  // Load gulp
  var gulp = require('gulp');

  // Allows for conditional statements in gulp
  var gulpif = require('gulp-if');

  // Check whether we're in production mode
  var isProduction = process.env.RAILS_ENV === 'production'

  // List all the used paths
  var paths = {
    // Source files
    src: {
      // CSS files
      css: [
        // CSS Framework
        'src/assets/stylesheets/lib/foundation.css',
        // Font Awesome
        'node_modules/font-awesome/css/font-awesome.css',
        // Datepicker
        'node_modules/pikaday/css/pikaday.css'
      ],
      // SCSS Files
      scss: [
        // Main CSS File
        'src/assets/stylesheets/calcentral.scss'
      ],
      // All the fonts
      fonts: [
        'node_modules/font-awesome/fonts/**/*.*'
      ],
      // Images
      img: 'src/assets/images/**/*.*',
      // Main index.html file
      index: 'src/index.html',
      js: {
        external: [
          // Date parsing
          'node_modules/moment/moment.js',
          // Libraries (google analytics)
          'src/assets/javascripts/lib/**/*.js',
          // Human Sorting in JavaScript
          'node_modules/js-natural-sort/naturalSort.js',
          // Remote JavaScript error logging
          // TODO - update to official version when
          // https://github.com/getsentry/raven-js/issues/197 is resolved
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
          // https://github.com/angular/angular.js/issues/4030 is fixed
          'src/assets/javascripts/angularlib/swipeDirective.js',
        ],
        // Our own files, we put this in a separate array to make sure we run
        // ng-annotate on it
        internal: [
          'src/assets/javascripts/**/*.js'
        ],
        // The JS templates files ($templateCache)
        templates: [
          'public/assets/templates/templates.js'
        ]
      },
      // List the HTML template files
      // Will be converted into templates.js
      templates: 'src/assets/templates/**/*.html'
    },
    // Build files
    dist: {
      css: 'public/assets/stylesheets',
      fonts: 'public/assets/fonts',
      img: 'public/assets/images',
      js: 'public/assets/javascripts',
      templates: 'public/assets/templates'
    }
  };

  /**
   * Images task
   *   Optimize images
   *   Copy files
   */
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
      .pipe(gulp.dest(paths.dist.img)
    );
  });

  /**
   * CSS Task
   *   Add prefixes
   *   Convert SASS to CSS
   *   Minify
   *   Concatenate
   *   Copy files
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
    // Minify the CSS in production
    var minifyCSS = require('gulp-minify-css');

    return streamqueue({
        objectMode: true
      },
      gulp.src(paths.src.css),
      gulp.src(paths.src.scss)
        .pipe(sass())
        .pipe(autoprefixer({
          cascade: false
        })
      ))
      // Minify CSS
      .pipe(gulpif(isProduction, minifyCSS()))
      // Combine the files
      .pipe(concat('application.css'))
      // Output to the correct directory
      .pipe(gulp.dest(paths.dist.css)
    );
  });

  /**
   * Fonts task
   *   Copy files
   */
  gulp.task('fonts', function() {
    return gulp.src(paths.src.fonts)
      .pipe(gulp.dest(paths.dist.fonts)
    );
  });

  /**
   * Templates task
   *   Concatenate the contents of all .html-files in the templates directory
   *   and save to public/templates.js
   */
  gulp.task('templates', function() {
    // Template cache will put all the .html files in the angular templateCache
    var templateCache = require('gulp-angular-templatecache');

    return gulp.src(paths.src.templates)
      .pipe(templateCache({
        // We create a standalone module called 'templates'
        // This makes it easier to load in CalCentral
        standalone: true
      }))
      .pipe(gulp.dest(paths.dist.templates)
    );
  });

  /**
   * JavaScript task
   *   Add annotations
   *   Concatenate
   *   Minify
   *   Hash
   * We need to make sure the templates.js file is included into the
   * concatenated files.
   */
  gulp.task('js', ['templates'], function() {
    var concat = require('gulp-concat');
    var ngAnnotate = require('gulp-ng-annotate');
    var uglify = require('gulp-uglify');

    // Combine the templates JS and reqular JS
    var streamqueue = require('streamqueue');
    return streamqueue({
        objectMode: true
      },
      gulp.src(paths.src.js.external),
      gulp.src(paths.src.js.internal)
        // Annotate the internal AngularJS files
        .pipe(ngAnnotate()
      ),
      gulp.src(paths.src.js.templates))
      .pipe(gulpif(isProduction, uglify()))
      .pipe(concat('application.js'))
      .pipe(gulp.dest(paths.dist.js)
    );
  });

  /**
   * Index task
   */
  gulp.task('index', ['images', 'templates', 'js', 'css', 'fonts'], function() {
    return gulp.src(paths.src.index)
      .pipe(gulp.dest('public')
    );
  });

  gulp.task('revall', ['index'], function() {
    var revall = require('gulp-rev-all');
    return gulp.src('public/assets/**', 'public/index.html')
      .pipe(revall({
        ignore: [
          /^\/favicon.ico$/g,
          '.html'
        ]
      }))
      .pipe(gulp.dest('cdn')
    );
  });

  /**
   * Build Clean task
   * Remove all the files generated by the build
   */
  gulp.task('build-clean', function(callback) {
    var del = require('del');
    del(
      [
        'public/assets/',
        'public/index.html'
      ], callback
    );
  });

  /**
   * Build task
   * We build all the files in this task, we need to make sure the clean-up
   * happens before everything else
   */
  gulp.task('build', function(callback) {
    var runSequence = require('run-sequence');

    runSequence(
      'build-clean',
      [
        'images',
        'templates',
        'js',
        'css',
        'fonts',
        'index'
      ],
      'revall',
      callback
    );
  });

  // TODO - 'browser-sync'

  // gulp.task('default', ['build'], function() {
  //   gulp.watch(paths.src.index, ['index', browserSync.reload]);
  //   gulp.watch(paths.src.css, ['css']);
  //   gulp.watch(paths.src.fonts, ['fonts', browserSync.reload]);
  //   gulp.watch(paths.src.js, ['js', browserSync.reload]);
  //   gulp.watch(paths.src.img, ['images', browserSync.reload]);
  // });
})();

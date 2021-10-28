 // dont' forget config stuff in settings.local.php

'use strict';
var git = require('gulp-git');
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');
var plumber = require ('gulp-plumber');
var gutil = require('gulp-util');
var del = require('del');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var urlAdjuster = require('gulp-css-url-adjuster');

// Config defaults.
var config = {
  proxy_url: undefined
};

// Include local file for overriding config, don't fail if it doesn't exist.
try {
  config = require('./config.json');
} catch (error) {
}

// report errors but continue gulpin'
var onError = function (err) {
  gutil.beep();
  console.log(err.messageFormatted);
  this.emit('end'); // super crit
};

//////////////////////////////////////
// Begin Gulp Tasks
//////////////////////////////////////

////// DEVELOPMENT
//////////////////

var sassBuild = function() {
  return gulp.src('./sass/**/*.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./dist/css'));
};

// Rename and move Javascript Task (move javascript)
var jsBuild = function() {
  return gulp.src('./js/**/*.js')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(rename(function (path) {
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest('./dist/js'));
};

gulp.task('sass', sassBuild);

gulp.task('js', jsBuild);

// Watch Task (for new changes)
gulp.task('watch', function() {
  gulp.watch('./sass/**/*', ['sass']);
  gulp.watch('./js/**/*.js', ['js']);
});

// BrowserSync Task (refresh browser if files change)
gulp.task('browserSync', function() {
  browserSync.init([
    ('./dist/css/*.css'),
    ('./dist/js/**/*.js'),
    ('./img/**/*'),
    ('./fonts/**/*')
  ],{
    proxy: config.proxy_url,
    open: false
  });
});

// Git rebase, fixcss and fixjs have to be completed first.
gulp.task('rebase-continue', ['fixcss', 'fixjs'], function() {
  git.exec({
    args: 'rebase --continue'
  });
});

// Recompile Sass and git add the files.
gulp.task('fixcss', function() {
  return sassBuild().pipe(git.add());
});

// Recompile JS and git add the files.
// Wait until fixcss runs, we don't want two git add operations happening at the
// same time.
// @todo Combine streams.
gulp.task('fixjs', ['fixcss'], function() {
  return jsBuild().pipe(git.add());
});

gulp.task('fix', ['fixcss', 'fixjs', 'rebase-continue']);


// Server Tasks
// gulp.task('default', ['sass','js','browserSync','watch']);
gulp.task('default', function(callback) {
  // runSequence('sass','js','watch','browserSync',callback);
  runSequence('watch','browserSync',callback);
});

////// PRODUCTION
/////////////////

//testing
gulp.task('images', function() {
    return gulp.src('img/skin/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img/skin'));
});

gulp.task('urls', function() {
 gulp.src('./dist/css/de_theme.css').
  pipe(urlAdjuster({
    replace: ['/img/skin/','/dist/img/skin/'],
  }))
  .pipe(gulp.dest('./dist/css/'));
});


// Delete CSS and JS files in prep for final build
gulp.task('clean', function() {
  del([
    './dist/css/**',
    './dist/js/**',
    './dist/img/**',
    './dist/maps/**'
  ]);
});

// Final Build Task for production sites
gulp.task('build', function(){
  gulp.src('./sass/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe(urlAdjuster({
      replace: ['../img/skin/','../../dist/img/skin/'],
    }))
    .pipe(gulp.dest('./dist/css'));

  gulp.src('./js/**/*.js')
    .pipe(rename(function (path) {
      path.basename += ".min";
      path.extname = ".js"
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));

  gulp.src('img/skin/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/skin'));

  // gulp.src('./dist/css/de_theme.css').
  //   pipe(urlAdjuster({
  //     replace: ['/img/skin/','/dist/img/skin/'],
  //   }))
  //   .pipe(gulp.dest('./dist/css/'));

  // testing

});

/*eslint-disable*/
'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var sh = require('shelljs');
var xeditor = require("gulp-xml-editor");
var semver = require('semver');
var react = require('gulp-react');
var browserSync = require('browser-sync').create();
var inquirer = require("inquirer");

var paths = {
  sass_main: ['scss/app.scss'],
  sass_all: ['scss/*.scss'],
  css_src: ['www/css/**/*.css'],
  css_dst: './www/css/',
  html: ['www/index.html'],
  js: ['www/js/**/*.js'],
  jsx_src: 'www/js/ui/**/*.jsx',
  jsx_dst: 'www/js/ui/compiled',
  config_xml: 'config.xml'
};
/*eslint-enable*/

gulp.task('default', ['help']);
gulp.task('compile', ['sass', 'jsx']);

gulp.task('help', function () {
  console.log();
  console.log('+------------------------------------------------------------------------------------+');
  console.log('|                                 =====  USAGE  =====                                |');
  console.log('+------------------------------------------------------------------------------------+');
  console.log('| gulp serve       - start http server with live reload                              |');
  console.log('| gulp compile     - same as "gulp sass jsx"                                         |');
  console.log("| gulp run-android - compile + 'cordova run android'                                 |");
  console.log("| gulp run-ios     - compile + 'cordova run ios'                                     |");
  console.log('| gulp sass        - compile scss files                                              |');
  console.log('| gulp jsx         - compile jsx files                                               |');
  console.log('| gulp bump        - interactively bump app version in config.xml                    |');
  console.log('| gulp version     - prints current(last) app version from config.xml                |');
  console.log('+------------------------------------------------------------------------------------+');
  console.log();
});

// compiles scss files
gulp.task('sass', function (done) {
  console.log('compiling sass files.');
  gulp.src(paths.sass_main)
    .pipe(sass({
      errLogToConsole: true,
      sourceComments: 'normal'
    }))
    .pipe(gulp.dest(paths.css_dst))
    .on('end', done);
});

// compiles jsx files
gulp.task('jsx', function () {
  console.log('compiling jsx files.');
  return gulp.src(paths.jsx_src)
    .pipe(react())
    .pipe(gulp.dest(paths.jsx_dst));
});

// start http server with live reload
gulp.task('serve', ['compile'], function () {
  browserSync.init({
    notify: false,
    files: [paths.html, paths.css_src, paths.js],
    logPrefix: 'SRV',
    logFileChanges: true,
    logConnections: true,
    open: false,
    reloadDelay: 2000,
    ui: false,
    ghostMode: false,
    server: {
      port: 3000,
      baseDir: '.',
      index: 'www/index.html',
      directory: true
    }
  });

  gulp.watch(paths.sass_all, ['sass']);
  gulp.watch(paths.jsx_src, ['jsx']);
});

gulp.task('run-android', ['compile'], function(){
  sh.exec('cordova run android');
});

gulp.task('run-ios', ['compile'], function(){
  sh.exec('cordova run ios');
});

gulp.task('bump', ['version'], function () {
  // hack to avoid gulp log messing with inquirer output
  setTimeout(doPrompt, 1000);
  function doPrompt() {
    inquirer.prompt([
      {
        type: 'list',
        name: 'version',
        message: 'WHICH VERSION DO YOU WANT TO BUMP?',
        choices: [
          '[cancel]',
          'PATCH 0.0.x',
          'MINOR 0.x.0',
          'MAJOR x.0.0'
        ]
      }
    ], function (answer) {
      if (answer.version === '[cancel]') return;
      if(answer.version.indexOf('PATCH')===0){
        bump('patch');
        return;
      }
      if(answer.version.indexOf('MINOR')===0){
        bump('minor');
        return;
      }
      if(answer.version.indexOf('MAJOR')===0){
        bump('major');
        return;
      }
    });
  }
});

gulp.task('version', function () {
  gulp.src(paths.config_xml)
    .pipe(xeditor(function (xml, xmljs) {

      var oldVer = xml.root().attr('version').value();
      console.log('Current app verison: ' + oldVer);
      return xml;
    }));
});

// UTILITY FUNCTIONS
function bump(version) {
  gulp.src(paths.config_xml)
    .pipe(xeditor(function (xml, xmljs) {

      var oldVer = xml.root().attr('version').value();
      console.log('OLD VERSION: ' + oldVer);

      var newVer = semver.inc(oldVer, version);
      console.log('NEW VERSION: ' + newVer);
      xml.root().attr('version').value(newVer);

      return xml;
    }))
    .pipe(gulp.dest('.'));
}

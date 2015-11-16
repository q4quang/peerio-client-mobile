/*eslint-disable*/
'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var sh = require('shelljs');
var fs = require('fs');
var xeditor = require('gulp-xml-editor');
var semver = require('semver');
var react = require('gulp-react');
var browserSync = require('browser-sync').create();
var inquirer = require('inquirer');
var _ = require('lodash');
var minimist = require('minimist');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var globbing = require('gulp-css-globbing');
var babel = require('gulp-babel');
var runSequence = require('run-sequence');
var clean = require('gulp-clean');
var cp = require('child_process');

var babelOptions = {
    compact: false,
    presets: ["react"],
    plugins: [
        "syntax-function-bind",
        "transform-function-bind",
        "transform-object-assign",
        "transform-es2015-arrow-functions",
        "transform-es2015-block-scoped-functions",
        "transform-es2015-block-scoping",
        "transform-es2015-destructuring",
        "transform-es2015-for-of",
        "transform-es2015-function-name",
        "transform-es2015-shorthand-properties",
        "transform-es2015-spread"
    ],
    ast: false
};


// extracting --cli --parameters
var knownOptions = {
    boolean: 'api',
    default: {}
};
var supportedBrowsers = ['ios >= 3.2', 'chrome >= 37', 'android >= 4.2'];

var options = minimist(process.argv.slice(2), knownOptions);

// put all the paths here
var paths = {
    sass_main: ['scss/app.scss'],
    sass_all: ['scss/**/*.scss'],
    css_src: ['www/css/**/*.css'],
    css_dst: './www/css/',
    html: ['www/index.html'],
    js_compiled: ['www/js/compiled/**/*.js'],
    jsx_src: 'www/js/jsx/**/*.jsx',
    jsx_dst: 'www/js/compiled/jsx',
    js_src: ['!www/js/compiled/**/*', '!www/js/_old/**/*', 'www/js/**/*.js'],
    js_dst: 'www/js/compiled',
    config_xml: 'config.xml',
    peerio_client_api: 'bower_components/peerio-client-api/dist/*.js',
    bower_installer_dst: 'www/bower'
};
/*eslint-enable*/

gulp.task('default', ['help']);
gulp.task('compile', ['bower-installer'], function (done) {
    return runSequence('compile-clean', ['jsx', 'sass', 'js'], done);
});

gulp.task('js', function () {
    console.log('compiling jss files.');
    gulp.src(paths.js_src)
        .pipe(babel(babelOptions))
        .pipe(gulp.dest(paths.js_dst));
});

gulp.task('compile-clean', function () {
    return gulp.src([paths.js_dst, paths.css_dst], {read: false})
        .pipe(clean());
});

gulp.task('help', function () {
    console.log();
    console.log('+---------------------------------------------------------------------------------------+');
    console.log('|                                 =====  USAGE  =====                                   |');
    console.log('+---------------------------------------------------------------------------------------+');
    console.log('| gulp serve       - start http server with live reload                                 |');
    console.log('| gulp serve --api - start http server with live reload and watch symlinked peerio api  |');
    console.log('| gulp compile     - same as "gulp sass jsx"                                            |');
    console.log("| gulp run-android - compile + 'cordova run android'                                    |");
    console.log("| gulp run-ios     - compile + 'cordova run ios'                                        |");
    console.log('| gulp sass        - compile scss files                                                 |');
    console.log('| gulp jsx         - compile jsx files                                                  |');
    console.log('| gulp bump        - interactively bump app version in config.xml                       |');
    console.log('| gulp version     - prints current(last) app version from config.xml                   |');
    console.log('+---------------------------------------------------------------------------------------+');
    console.log();
});

// install external references
gulp.task('bower-installer', function(done) {
    console.log('running bower-installer');
    bowerInstaller();
    done();
});
// compiles scss files
gulp.task('sass', function (done) {
    console.log('compiling sass files.');
    gulp.src(paths.sass_main)
        .pipe(globbing({
            extensions: ['.scss']
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            sourceComments: false
        }))
        .pipe(autoprefixer({
            browsers: supportedBrowsers,
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.css_dst))
        .on('end', done)
        .pipe(browserSync.stream());
});

// compiles jsx files
gulp.task('jsx', function () {
    console.log('compiling jsx files.');
    return gulp.src(paths.jsx_src)
        .pipe(babel(babelOptions))
        .pipe(gulp.dest(paths.jsx_dst));
});

// starts http server with live reload
// sass an jsx files are watched and compiled to www
// peerio-api-client repository is watched if --api option is provided and copied to www too
// http server watches www folder and reloads
gulp.task('serve', ['compile'], function () {

    // watching symlinked peerio-client-api package
    if (options.api) {
        // watch triggers for every file, so we debounce it
        var copyApi = _.debounce(bowerInstaller, 1500);

        copyApi();

        gulp.watch(paths.peerio_client_api, copyApi);

    }

    // starting http server with watcher
    browserSync.init({
        notify: false,
        files: [paths.html, paths.css_src, paths.js_compiled],
        logPrefix: 'SRV',
        logFileChanges: true,
        logConnections: true,
        open: false,
        reloadDelay: 4000,
        ui: false,
        ghostMode: false,
        server: {
            port: 3000,
            baseDir: '.',
            index: 'www/index.html',
            directory: true
        }
    });

    // compile watchers
    gulp.watch(paths.sass_all, ['sass']);
    gulp.watch(paths.jsx_src, ['jsx']);

});

gulp.task('run-android', ['compile'], function () {
    bowerInstaller();
    sh.exec('cordova run android');
});

gulp.task('run-ios', ['compile'], function () {
    bowerInstaller();
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
                    '[DO NOT CHANGE]',
                    'PATCH 0.0.x',
                    'MINOR 0.x.0',
                    'MAJOR x.0.0'
                ]
            }
        ], function (answer) {
            if (answer.version === '[cancel]') return;
            if (answer.version.indexOf('PATCH') === 0) {
                bump('patch');
                return;
            }
            if (answer.version.indexOf('MINOR') === 0) {
                bump('minor');
                return;
            }
            if (answer.version.indexOf('MAJOR') === 0) {
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
            console.log('Current app version: ' + oldVer);
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

function bowerInstaller() {
    cp.exec('rm -rf ' + paths.bower_installer_dst);
    cp.exec('bower-installer');
}

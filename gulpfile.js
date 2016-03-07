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
var inject = require('gulp-inject');
var series = require('stream-series');
var replace = require('gulp-replace');
var xcode = require('./extra/peerio-xcode.js');
var plist = require('plist');

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
    boolean: ['api', 'release'],
    default: {}
};
var supportedBrowsers = ['ios >= 3.2', 'chrome >= 37', 'android >= 4.2'];

var options = minimist(process.argv.slice(2), knownOptions);

// put all the paths here
var paths = {
    sass_main: ['src/scss/app.scss'],
    sass_all: ['src/scss/**/*.scss'],
    css_src: ['www/css/**/*.css'],
    css_dst: './www/css/',
    html_src: ['src/index.html'],
    html_dst: ['www/index.html'],
    jsx_src: 'src/js/jsx/**/*.jsx',
    jsx_dst: 'www/js/jsx',
    jsx_preinit_src: 'src/js/jsx-preinit/**/*.jsx',
    jsx_preinit_dst: 'www/js/jsx-preinit',
    jsx_postinit_src: 'src/js/jsx-postinit/**/*.jsx',
    jsx_postinit_dst: 'www/js/jsx-postinit',
    js_src: ['!www/js/js/_old/**/*', 'src/js/**/*.js'],
    js_dst: 'www/js/js',
    js_compiled: ['www/js/**/*.js'],
    js_inject: 'www/js/js/**/*.js',
    jsx_inject: 'www/js/jsx/**/*.js',
    jsx_preinit_inject: 'www/js/jsx-preinit/**/*.js',
    jsx_postinit_inject: 'www/js/jsx-postinit/**/*.js',
    config_xml: 'config.xml',
    peerio_client_api: 'bower_components/peerio-client-api/dist/*.js',
    bower_installer_dst: 'www/bower',
    static_src: ['*media/**/*', '*locale/**/*', 'extra/cordova.js'],
    static_dst: 'www/',
    clean_dst: ['www/js', 'www/css', 'www/index.html', 
                'www/media', 'www/locale'],
    project_plist: 'platforms/ios/Peerio/Peerio-Info.plist'
};
/*eslint-enable*/

gulp.task('default', ['help']);
gulp.task('compile', ['bower-installer'], function (done) {
    return runSequence('compile-clean', ['jsx', 'jsx-preinit', 'jsx-postinit', 'sass', 'js', 'static-files'], 'index', done);
});

gulp.task('index', function () {
  var target = gulp.src(paths.html_src);
  var sourcesJs = gulp.src(paths.js_inject, {read: false});
  var sourcesJsx = gulp.src(paths.jsx_inject, {read: false});
  var sourcesJsxPreInit = gulp.src(paths.jsx_preinit_inject, {read: false});
  var sourcesJsxPostInit = gulp.src(paths.jsx_postinit_inject, {read: false});
  console.log('DON\'T FORGET TO SET PROVISIONING PROFILE TO ios team provisioning profile: com.peerio');
  console.log('OTHERWISE PUSH NOTIFICATIONS WOULD NOT WORK');
  var result = target
  .pipe(inject(
      series(sourcesJs, sourcesJsxPreInit, sourcesJsx, sourcesJsxPostInit), 
      {addRootSlash: false, ignorePath: 'www'}
  ));
  // a piece of replacement code
  if(!options.release) result = result.pipe(replace(/<!-- release -->[^]*?<!-- \/release -->\s*\r*\n*/mg, ''));
  if(options.release) result = result.pipe(replace(/<!-- debug -->[^]*?<!-- \/debug -->\s*\r*\n*/mg, ''));

  return result.pipe(gulp.dest('./www'));
});

gulp.task('js', function () {
    console.log('compiling js files.');
    gulp.src(paths.js_src)
        .pipe(babel(babelOptions))
        .pipe(gulp.dest(paths.js_dst));
});

gulp.task('compile-clean', function () {
    return gulp.src(paths.clean_dst, {read: false})
        .pipe(clean());
});

gulp.task('prepare-plist', function () {
    var info = plist.parse(fs.readFileSync(paths.project_plist, 'utf8'));
    var change = false;
    var itsEncryption = true;
    var complianceCode = '50fca128-07a4-40a7-8a57-e48418e296ec';
    if(info['ITSAppUsesNonExemptEncryption'] != itsEncryption) {
        change = true;
        info['ITSAppUsesNonExemptEncryption'] = itsEncryption;
    }
    if(info['ITSEncryptionExportComplianceCode'] != complianceCode) {
        change = true;
        info['ITSEncryptionExportComplianceCode'] = complianceCode;
    }
    if(change) {
        console.log('Applying changes to plist file');
        fs.writeFileSync(paths.project_plist, plist.build(info));
    } else {
        console.log('No changes to plist needed. Skipping');
    }
});

gulp.task('prepare-pbx', function () {
    var profile = options.release ? 
        '762f2597-7db7-4626-8eba-117f50135387' : false;
    xcode.apply({ 
        path: 'platforms/ios/Peerio.xcodeproj/project.pbxproj', 
        push: true, 
        dataProtection: true, 
        team: '7L45B96YPK', 
        profile: profile, 
        disableBitcode: true,
        deploymentTarget: '8.2',
        targetedDeviceFamily: 1
    });
});

gulp.task('prepare', ['prepare-pbx', 'prepare-plist'], function () {
   return true;
});

gulp.task('help', function () {
    console.log();
    console.log('+-----------------------------------------------------------------------------------------------+');
    console.log('|                                         =====  USAGE  =====                                   |');
    console.log('+-----------------------------------------------------------------------------------------------+');
    console.log('| gulp serve               - start http server with live reload                                 |');
    console.log('| gulp serve --api         - start http server with live reload and watch symlinked peerio api  |');
    console.log('| gulp compile             - same as "gulp sass jsx"                                            |');
    console.log('| gulp compile --release   - release version                                                    |');
    console.log('| gulp run-android         - compile + "cordova run android"                                    |');
    console.log('| gulp run-ios             - compile + "cordova run ios"                                        |');
    console.log('| gulp sass                - compile scss files                                                 |');
    console.log('| gulp jsx                 - compile jsx files                                                  |');
    console.log('| gulp bump                - interactively bump app version in config.xml                       |');
    console.log('| gulp version             - prints current(last) app version from config.xml                   |');
    console.log('+-----------------------------------------------------------------------------------------------+');
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
            cascade: false,
            grid: false
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

gulp.task('jsx-preinit', function () {
    console.log('compiling jsx preinit files.');
    return gulp.src(paths.jsx_preinit_src)
        .pipe(babel(babelOptions))
        .pipe(gulp.dest(paths.jsx_preinit_dst));
});

gulp.task('jsx-postinit', function () {
    console.log('compiling jsx postinit files.');
    return gulp.src(paths.jsx_postinit_src)
        .pipe(babel(babelOptions))
        .pipe(gulp.dest(paths.jsx_postinit_dst));
});

gulp.task('static-files', function () {
    console.log('copying static files');
    return gulp.src(paths.static_src)
        .pipe(gulp.dest(paths.static_dst));
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
    gulp.watch(paths.html_src, ['index']);
    gulp.watch(paths.sass_all, ['sass']);
    gulp.watch(paths.jsx_src, ['jsx']);
    gulp.watch(paths.js_src, ['js']);
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
    console.log('bower-installer');
    cp.execSync('rm -rf ' + paths.bower_installer_dst);
    cp.execSync('bower-installer');
}

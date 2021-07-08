// based on https://andy-carter.com/blog/a-beginners-guide-to-the-task-runner-gulp

let gulp = require('gulp');

let concat = require('gulp-concat');
let sass = require('gulp-sass')(require("node-sass"));
let autoprefixer = require('gulp-autoprefixer');
let zip = require("gulp-zip");
let uglify = require('gulp-uglify');
let gscan = require("gscan");

// utiltities
let chalk = require("chalk");
var _ = require("lodash");

const levels = {
    error: chalk.red,
    warning: chalk.yellow,
    recommendation: chalk.yellow,
    feature: chalk.green
  };

const distDir = 'dist/';
const themeName = require('./package.json').name;
const themeVersion = require('./package.json').version;
const themeZip = themeName + '-' + themeVersion + '.zip';


// STYLES
gulp.task('sass', function(){
    return gulp.src('_sass/**/*.scss')
            .pipe(sass({outputStyle: 'compressed'}))
            .pipe(autoprefixer())
            .pipe(concat('main.css'))
            .pipe(gulp.dest('assets/css'));
});

gulp.task('prismcss', function(){
    return gulp.src('assets/css/prism.css')
            .pipe(sass({outputStyle: 'compressed'}))
            .pipe(concat('prism.min.css'))
            .pipe(gulp.dest('assets/css'));
});

//  uncompressed sass, useful for debugging styles while developing. 
// this task is not inclucded in the default task and related series.
gulp.task('sass-dev', function(){
    return gulp.src('_sass/**/*.scss')
            .pipe(sass())
            .pipe(autoprefixer())
            .pipe(concat('main.css'))
            .pipe(gulp.dest('assets/css'));
});

// JAVASCRIPT
gulp.task('js', function(){
    return gulp.src(['assets/js/vendor/jquery/jquery-1.12.4.min.js',
                     'assets/js/plugins/jquery.fitvids.js',
                     'assets/js/plugins/jquery.greedy-navigation.js',
                     'assets/js/plugins/jquery.magnific-popup.js',
                     'assets/js/plugins/jquery.smooth-scroll.min.js',
                     'assets/js/plugins/stickyfill.min.js',
                     'assets/js/_main.js'])
            .pipe(concat('main.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('assets/js'));
});

gulp.task('prismjs',function(){
    return gulp.src('assets/js/prism.js')
            .pipe(concat('prism.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('assets/js'));
});


// BRING IT TOGETHER
gulp.task('zip', function () {
    
    return gulp.src([
        '**',
        '!node_modules', 
        '!node_modules/**',
        '!dist', 
        '!dist/**', 
        '!sass/**'
    ])
        .pipe(zip(themeZip))
        .pipe(gulp.dest(distDir));
});

// output code is borrowed from ThoughtBot's old ghost theme template.
// https://github.com/thoughtbot/ghost-theme-template/blob/master/gulpfile.babel.js
// repo is now archived. 

gulp.task('gscan', function () {
    
    function outputResult(result) {
        console.log('-', levels[result.level](result.level), result.rule);
    }

    function printGscanResults(theme) {
        theme = gscan.format(theme);
    
        console.log(chalk.bold.underline('\nRule Report:'));
    
        if (!_.isEmpty(theme.results.error)) {
          console.log(chalk.red.bold.underline('\n! Must fix:'));
          _.each(theme.results.error, outputResult);
        }
    
        if (!_.isEmpty(theme.results.warning)) {
          console.log(chalk.yellow.bold.underline('\n! Should fix:'));
          _.each(theme.results.warning, outputResult);
        }
    
        if (!_.isEmpty(theme.results.recommendation)) {
          console.log(chalk.red.yellow.underline('\n? Consider fixing:'));
          _.each(theme.results.recommendation, outputResult);
        }
    
        if (!_.isEmpty(theme.results.pass)) {
          console.log(chalk.green.bold.underline('\n\u2713', theme.results.pass.length, 'Passed Rules'));
        }
    
        console.log('\n...checks complete.');
      };

    return gscan.checkZip({ path: distDir + themeZip, name: themeName})
        .then(printGscanResults);
});

gulp.task('default', gulp.series('sass', 'prismcss', 'js', 'prismjs', 'zip', 'gscan'));

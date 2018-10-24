// based on https://andy-carter.com/blog/a-beginners-guide-to-the-task-runner-gulp

var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

sass.compiler = require("node-sass");

gulp.task('sass', function(){
    return gulp.src('_sass/**/*.scss')
            .pipe(sass({outputStyle: 'compressed'}))
            .pipe(autoprefixer({browsers: ['last 2 versions']}))
            .pipe(concat('main.css'))
            .pipe(gulp.dest('assets/css'));
});

gulp.task('sass-dev', function(){
    return gulp.src('_sass/**/*.scss')
            .pipe(sass())
            .pipe(autoprefixer({browsers: ['last 2 versions']}))
            .pipe(concat('main.css'))
            .pipe(gulp.dest('assets/css'));
});

gulp.task('zip', ['sass'], function () {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var themeVersion = require('./package.json').version;
    var filename = themeName + '-' + themeVersion + '.zip';

    return gulp.src([
        '**',
        '!node_modules', '!node_modules/**',
        '!dist', '!dist/**', '!sass/**'
    ])
        .pipe(zip(filename))
        .pipe(gulp.dest(targetDir));
});


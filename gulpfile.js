var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        jshint = require('gulp-jshint'),
        input = {
            'javascript': 'client/js/app/*.js'
        },
output = {};

//
gulp.task('default', [/*'compress',*/ 'jshint'], function () {
    // watch for JS changes
    gulp.watch('client/js/app/*.js', function () {
        gulp.run('jshint', 'jshint');
    });
});

//
gulp.task('compress', function () {
    return gulp.src(input.javascript)
            .pipe(uglify())
            .pipe(gulp.dest('client/js/app.min'));
});

// JS hint task
gulp.task('jshint', function () {
    gulp.src(input.javascript)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});
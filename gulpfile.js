var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

//
gulp.task('default', [/*'compress',*/ 'jshint'], function () {
    // watch for JS changes
    gulp.watch('client/js/app/*.js', function () {
        gulp.run('jshint', 'jshint');
    });
});

//
gulp.task('compress', function () {
    return gulp.src('client/js/app/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('client/js/app.min'));
});

// JS hint task
gulp.task('jshint', function () {
    gulp.src('client/js/app/*.js')
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});
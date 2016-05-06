var PORT = '4000',
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    compress = require('gulp-compress'),
    cleanCSS = require('gulp-clean-css'),
    tinylr;

//express
gulp.task('express', function() {
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')({ port: 35729 }));
    app.use(express.static(__dirname));
    app.listen(PORT, '0.0.0.0');
});

console.log('Listening to port: ' + PORT);

// livereload
gulp.task('livereload', function() {
    tinylr = require('tiny-lr')();
    tinylr.listen(35729);
});

// jshint
gulp.task('jshint', function() {
    gulp.src('./client/js/app/*')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// watch
gulp.task('watch', function() {
    gulp.watch('client/js/app/*.js', ['jshint']);
    gulp.watch('client/js/app/*.js', notifyLiveReload);
    gulp.watch('client/css/style.css', notifyLiveReload);
    gulp.watch('client/index.html', notifyLiveReload);
});

// default
gulp.task('default', ['express', 'livereload', 'watch'], function() {

});

/**
 * Notify live reload
 * @param  {Object} event Event Object
 * @return {[type]}       [description]
 */
function notifyLiveReload(event) {
    var fileName = require('path').relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}

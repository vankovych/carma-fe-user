var gulp = require('gulp');
var sass = require('gulp-sass');
var findup = require('findup-sync');
const node_modules = findup('node_modules')
var options = {
    includePaths: [node_modules] // this will find any node_modules above the current working directory
}
gulp.task('default', function(){
gulp.src('./web-uikit-master/**/*.scss')
 .pipe(sass(options).on('error', sass.logError))

.pipe(gulp.dest('./web-uikit-master'));
});
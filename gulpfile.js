/* global require */

var gulp = require('gulp');
var gulpShell = require('gulp-shell');
var gulpTaskListing = require('gulp-task-listing');

gulp.task('default', gulpTaskListing);

gulp.task('publish', gulpShell.task([
  'aws s3 sync ui/ s3://anvil.blacklocus.com/ --cache-control max-age=0'
]));


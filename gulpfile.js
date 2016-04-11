var gulp = require('gulp');
var jsx = require('gulp-jsx');
 
gulp.task('default', function() {
  return gulp.src('source/**/*.js')
    .pipe(jsx({
      factory: 'React.createClass'
    }))
    .pipe(gulp.dest('dist'));
});
// Include gulp
var gulp = require('gulp'); 

// Include Our Plugins
var minifyCSS = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var fileinclude = require('gulp-file-include');
var imagemin = require('gulp-imagemin');
//var pngcrush = require('imagemin-pngcrush');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cssBase64 = require('gulp-css-base64');
var minifyHTML = require('gulp-minify-html');

//imagemin
gulp.task('imagemin', function () {
    return gulp.src('sourse_mobile/images/**/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest('www_mobile/images'))
        .pipe(livereload());
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
  gulp.src('sourse_mobile/js/**/*.js')
	.pipe(concat('all.js'))
	.pipe(gulp.dest('www_mobile/js'))
	.pipe(rename('all.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('www_mobile/js'))
	.pipe(livereload());
});

gulp.task('sass', function () {
    gulp.src('sourse_mobile/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('sourse_mobile/css'));
});

//Concatenate & Minify css
gulp.task('minify-css', function() {
  gulp.src('sourse_mobile/css/**/*.css')
	.pipe(concat('style.css'))
      .pipe(cssBase64({

      }))
	.pipe(prefix())
	.pipe(gulp.dest('www_mobile/css'))
	.pipe(rename('style.min.css'))
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('www_mobile/css'))
	.pipe(livereload());
});

//Create html pages
gulp.task('fileinclude', function() {
  gulp.src('sourse_mobile/templates/**/*.tpl.html')
    .pipe(fileinclude())
	.pipe(rename({
		extname: ""
	}))
	.pipe(rename({
		extname: ".html"
	}))
    //.pipe(minifyHTML())
	.pipe(gulp.dest('www_mobile'))
    .pipe(livereload());
});

//Run 
gulp.task('livereload', function() {
  gulp.src('./')
	.pipe(livereload());
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('sourse_mobile/js/**/*.js', ['scripts']);
	gulp.watch('sourse_mobile/scss/**/*.scss', ['sass']);
	gulp.watch('sourse_mobile/css/**/*.css', ['minify-css']);
	//gulp.watch('www_mobile/**/*.html', ['livereload']);
	gulp.watch('sourse_mobile/templates/**/*.html', ['fileinclude']);
	gulp.watch('sourse_mobile/images/**/*.*', ['imagemin']);
});

// Default Task
gulp.task('default', ['scripts', 'sass', 'minify-css', 'livereload', 'watch', 'fileinclude', 'imagemin']);
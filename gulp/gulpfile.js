var gulp	= require('gulp'),
	sass	= require('gulp-sass'),
	gluecss	= require('gulp-concat-css'),
	gluejs  = require('gulp-concat');
	clean	= require('gulp-clean-css'),
	plumber	= require('gulp-plumber'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefix = require('gulp-autoprefixer'),
	flatten = require('gulp-flatten');

var path ={
	source:		'../src',
	assets:		'../app/assets'
};


gulp.task('scss', function() {
    gulp.src([path.source + '/scss/app.scss'])
        .pipe(plumber())
        .pipe(sass({
			errLogToConsole: true,
			outputStyle: 'compressed'
		}))
		.pipe(autoprefix({
			browsers: [
				'ie >= 10',
				'ie_mob >= 10',
				'ff >= 30',
				'chrome >= 34',
				'safari >= 7',
				'opera >= 23',
				'ios >= 7',
				'android >= 4.4',
				'bb >= 10'
			]
		}))
        .pipe(gluecss('styles.min.css'))
 		.pipe(clean({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(path.assets + '/'));
});

gulp.task('js', function() {
    gulp.src([path.source + '/js/*.js'])
        .pipe(plumber())
        .pipe(gluejs('scripts.min.js'))
        .pipe(gulp.dest(path.assets + '/'));
});

gulp.task('fonts', function() {
    gulp.src([path.source + '/fonts/**/*.{ttf,woff,eot,svg,woff2}'])
		.pipe(flatten())
        .pipe(gulp.dest(path.assets + '/fonts/'));
});

gulp.task('images', function() {
    gulp.src([path.source + '/images/**/*'])
		.pipe(flatten({ includeParents: 1}))           
        .pipe(gulp.dest(path.assets + '/images/'));
});

gulp.task('watch', function() {
	gulp.watch(path.source + '/**/*', ['scss', 'js']);
});

gulp.task('default', ['scss', 'js', 'fonts', 'images', 'watch']);

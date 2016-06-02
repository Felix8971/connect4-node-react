var node,
    test,
    gulp              = require('gulp'),
    concat            = require('gulp-concat'),
    uglify            = require('gulp-uglify'),
    cssmin            = require('gulp-cssmin'),
    autoprefixer      = require('autoprefixer'),
    rename            = require('gulp-rename'),
    //jade              = require('gulp-jade'),
    //stylus            = require('gulp-stylus'),
    //spawn             = require('childish-process').spawn,
    pathJs            = './public/scripts/',
    pathLib           = './public/lib/';

// server launcher, kill it if already a process
// gulp.task('server', function() {
//   if (node) node.kill()
//   node = spawn('node', ['server.js'], {stdio: 'inherit'})
//   node.on('close', function (code) {
//     if (code === 8) {
//       console.log('Error detected, waiting for changes...');
//     }
//   });
// });


gulp.src('public/css/*.css')
  .pipe(cssmin())
  .pipe(concat('main.css'))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('public/css/'));

//concat && minify js in 1 file 
gulp.task('js', function() {//we’re defining a task named js
  gulp.src([pathLib+'react.min.js',
            pathLib+'react-dom.min.js',
            pathLib+'browser.min.js',
            pathLib+'ReactRouter.min.js',
            pathLib+'marked.min.js',
            pathLib+'underscore-min.js'
          ])
    .pipe(concat('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/lib/'))
});

// karma test
//gulp.task('test', function(){
  // if (test) test.kill();
  // test = spawn('karma', ['start'], ['karma.conf.js'], {stdio: 'inherit'});
  // test.stdout.on('data', function(data) {
  //   var buffer = new Buffer(data);
  //   console.log(buffer.toString('utf-8'));
  // });
  // test.on('exit', function(code) {
  //   if (code != 0) {
  //     console.log('failed: '+code);
  //   }
  // });
//});

// default init task which compress js && launch the server && set a watcher for js modifications
gulp.task('default', ['js'], function() {//A task may also be a list of other tasks.
	//gulp.start('server');
	gulp.watch(['./scripts/*.js'], function() {
		gulp.start('js')
	});
  console.log("xx");
  // gulp.watch(['./script/*.js'], function() {
  //   gulp.start('server')
  // });
  // gulp.watch(['./css/*.css'], function() {
  //   gulp.start('css')
  // });
});

// process.on('exit', function() {
//     if (node) node.kill();
//     if (test) test.kill();
// })
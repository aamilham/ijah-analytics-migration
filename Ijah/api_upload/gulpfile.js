/* change list : aamilham
1. change var to const
2. change function type
3. update syntax to gulp 4 */

const gulp = require( 'gulp' );
const server = require( 'gulp-develop-server' );
const jshint = require('gulp-jshint');
const { watch, series } = require('gulp');

// lint task
function lint() {
    return gulp.src('app.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default')); 
}

// run server
function serverStart(done) {
    server.listen({ path: './app.js' }, done);
}

// restart server if app.js changed
function serverRestart() {
    watch('./app.js', server.restart);
}

exports.default = series(lint, serverStart, serverRestart);

exports.lint = lint;
exports.serverStart = serverStart;
exports.serverRestart = serverRestart;
const { src, dest, watch, series, parallel } = require("gulp");
const connect = require('gulp-connect');
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const babel = require('gulp-babel');

// CONFIGURATION

const configs = {
  connect: {
    root: "./dist/",
    port: 8287,
    live: true
  },
  html: {
    in: "./src/html/**/*.html",
    out: "./dist/",
    watch: "./src/html/**/*.html",
  },
  scss: {
    in: "./src/scss/*.scss",
    out: "./dist/css/",
    watch: "./src/scss/**/*.scss",
  },
  js: {
    in: "./src/js/**/*.js",
    out: "./dist/js/",
    watch: "./src/js/**/*.js",
  }
};

// PIPELINE

//* Create basic development server using connect
async function connectInit() {
  return connect.server({
    root: configs.connect.root,
    port: configs.connect.port,
    livereload: configs.connect.live
  });
}

//* Compile HTML files with HtmlMin
function compileHtml() {
  return src(configs.html.in)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(configs.html.out))
    .pipe(connect.reload());
}

//* Compile SCSS files with Dart-SASS
function compileScss() {
  return src(configs.scss.in)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(dest(configs.scss.out))
    .pipe(connect.reload());
}

//* Compile JS files with Babel
function compileJs() {
  return src(configs.js.in)
    .pipe(babel({presets: ['@babel/env']}))
    .pipe(dest(configs.js.out))
    .pipe(connect.reload());
}

// WATCHERS

//* Watch and compile changes of Html files
async function watchHtml() {
  return watch([configs.html.watch], series(compileHtml));
}

//* Watch and compile changes of SCSS files
async function watchScss() {
  return watch([configs.scss.watch], series(compileScss));
}

//* Watch and compile changes of JS files
async function watchJs() {
  return watch([configs.js.watch], series(compileJs));
}

// TASKS

//* Compile all developement files
exports.compile = series(compileHtml, compileScss, compileJs);

//* Task launched when using `gulp`
exports.default = series(
  series(compileHtml, compileScss, compileJs),
  parallel(connectInit, watchHtml, watchScss, watchJs)
);

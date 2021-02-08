const { src, dest, watch, series, parallel } = require("gulp");
const connect = require('gulp-connect');
const htmlmin = require("gulp-htmlmin");
const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");

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

// WATCHERS

//* Watch and compile changes of Html files
async function watchHtml() {
  return watch([configs.html.watch], series(compileHtml));
}

//* Watch and compile changes of SCSS files
async function watchScss() {
  return watch([configs.scss.watch], series(compileScss));
}

// TASKS

//* Compile all developement files
exports.compile = series(compileHtml, compileScss);

//* Task launched when using `gulp`
exports.default = series(
  series(compileHtml, compileScss),
  parallel(connectInit, watchHtml, watchScss)
);

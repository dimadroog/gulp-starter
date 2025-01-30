let source_folder = 'app';
let project_folder = 'dist';

let patch = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
        lib: project_folder + '/lib/',
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        css: [source_folder + '/scss/*.scss', '!' + source_folder + '/scss/_*.scss'],
        js: [source_folder + '/js/*.js', '!' + source_folder + '/js/_*.js'],
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp,mp4,webm,webmanifest}',
        lib: [source_folder + '/lib/**', '!' + source_folder + '/lib/{_*,_*/**}'],
        fonts: source_folder + '/fonts/**/*',
        favicon: source_folder + '/favicon.ico',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp,mp4,webm,webmanifest}',
    },
    clean: './' + project_folder + '/**/*'
}

let { src, dest } = require('gulp');
let gulp = require('gulp');
let browsersync = require('browser-sync').create();
let fileinclude = require('gulp-file-include');
let del = require('del');
let sass = require('gulp-sass')(require('sass'));
let autoprefixer = require('gulp-autoprefixer');
let clean_css = require('gulp-clean-css');
let rename = require('gulp-rename');
let prettyHtml = require('gulp-pretty-html');
// let babel = require('gulp-babel');


function browserSync(params){
    browsersync.init({
        server:{
            baseDir: './' + project_folder + '/'
        },
        port:3000,
        notify: false,
    })
}

function html(){
    return src(patch.src.html)
        .pipe(fileinclude())
        .pipe(prettyHtml())
        .pipe(dest(patch.build.html))
        .pipe(browsersync.stream())
}

function css(){
    return src(patch.src.css)
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true,
                grid: true
            })
        )
        .pipe(dest(patch.build.css))
        // .pipe(browsersync.stream())
        .pipe(clean_css())
        .pipe(
            rename({
                extname: '.min.css',
            })
        )
        .pipe(dest(patch.build.css))
        .pipe(browsersync.stream())
}

function js(){
    return src(patch.src.js)
        .pipe(fileinclude())
        // .pipe(babel({
        //     presets: ['@babel/env']
        // }))
        .pipe(dest(patch.build.js))
        .pipe(browsersync.stream())
}

function images(){
    return src(patch.src.img, {encoding: false})
        .pipe(dest(patch.build.img))
        .pipe(browsersync.stream())
}

function fonts(){
    return src(patch.src.fonts, {encoding: false})
        .pipe(dest(patch.build.fonts))
}

function favicon(){
    return src(patch.src.favicon, {encoding: false})
        .pipe(dest(patch.build.html))
}

function lib(){
    return src(patch.src.lib)
        .pipe(dest(patch.build.lib))
}

function watchFiles(){
    gulp.watch([patch.watch.html], html);
    gulp.watch([patch.watch.css], css);
    gulp.watch([patch.watch.js], js);
    gulp.watch([patch.watch.img], images);
}

function clean(){
    return del(patch.clean);
}


let build = gulp.series(clean, gulp.parallel(images, js, css, html, fonts, favicon, lib));
let watch = gulp.parallel(build, watchFiles, browserSync);



exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
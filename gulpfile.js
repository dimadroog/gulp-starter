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
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico}',
        fonts: source_folder + '/fonts/**/*',
        lib: [source_folder + '/lib/**', '!' + source_folder + '/lib/{_*,_*/**}'],
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico}',
    },
    clean: './' + project_folder + '/'
}


let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    uglify = require('gulp-uglify-es').default,
    rename = require('gulp-rename'),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    babel = require('gulp-babel');




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
        .pipe(dest(patch.build.html))
        .pipe(browsersync.stream())
}


function css(){
    return src(patch.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true,
                grid: true
            })
        )
        .pipe(dest(patch.build.css))
        .pipe(browsersync.stream())
}


function js(){
    return src(patch.src.js)
        .pipe(fileinclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest(patch.build.js))
        .pipe(browsersync.stream())
}


function images(){
    return src(patch.src.img)
        .pipe(dest(patch.build.img))
        .pipe(src(patch.src.img))
        .pipe(dest(patch.build.img))
        .pipe(browsersync.stream())
}


function fonts(){
    return src(patch.src.fonts)
        .pipe(dest(patch.build.fonts))
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




let build = gulp.series(clean, gulp.parallel(images, js, css, html, fonts, lib));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;






/*only single use functions*/

// minify js and css files
gulp.task('min', async function() {
    let min_js = src(patch.src.js)
        .pipe(fileinclude())
        .pipe(dest(patch.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js',
            })
        )
        .pipe(dest(patch.build.js));

    let min_css = src(patch.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 5 versions'],
                cascade: true,
                grid: true
            })
        )
        .pipe(dest(patch.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: '.min.css',
            })
        )
        .pipe(dest(patch.build.css));

    return [min_css, min_js];
});

let source_folder = "app";
let project_folder = "dist";

let patch = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + project_folder + "/"
}


let { src, dest } = require("gulp"),
    gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    webp = require("gulp-webp"),
    webphtml = require("gulp-webp-html"),
    webpcss = require("gulp-webpcss");


function browserSync(params){
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/"
        },
        port:3000,
        notify: false,
    })
}


function html(){
    return src(patch.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(patch.build.html))
        .pipe(browsersync.stream())
}


function css(){
    return src(patch.src.css)
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true,
                grid: true
            })
        )
        .pipe(webpcss())
        .pipe(dest(patch.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css",
            })
        )
        .pipe(dest(patch.build.css))
        .pipe(browsersync.stream())
}


function js(){
    return src(patch.src.js)
        .pipe(fileinclude())
        .pipe(dest(patch.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js",
            })
        )
        .pipe(dest(patch.build.js))
        .pipe(browsersync.stream())
}


function images(){
    return src(patch.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(patch.build.img))
        .pipe(src(patch.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3, // 0 to 7
            })
        )
        .pipe(dest(patch.build.img))
        .pipe(browsersync.stream())
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


let build = gulp.series(clean, gulp.parallel(images, js, css, html));
let watch = gulp.parallel(build, watchFiles, browserSync);


exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
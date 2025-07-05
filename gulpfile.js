const { src, dest, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del')
const htmlMin = require('gulp-htmlmin')
const concat = require('gulp-concat')
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css')
const gulpAutoprefixer = require('gulp-autoprefixer')
const svgSprite = require('gulp-svg-sprite')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const gulpif = require('gulp-if');


const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const clean = () => {
    return del(['dist']);
};


const resources = () => {
    return src('src/resources/**')
    .pipe(dest('dist'))
};

const htmlMinify = () => {
    return src('src/**/*.html')
        .pipe(htmlMin({
        collapseWhitespace: isProd
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
};

const fonts = () => {
    return src('src/fonts/**')
        .pipe(dest('dist/fonts'));
};

const styles = () => {
    return src('src/styles/**/styles.scss')
    .pipe(gulpif(isDev, sourcemaps.init())) 
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(
        gulpAutoprefixer({
            cascade: false,
        })
    )
    .pipe(cleanCSS({
        level: isDev ? 0 : 2,
    }))
    .pipe(gulpif(isDev, sourcemaps.write())) 
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
};

const svgSprites = () => {
    return src('src/img/svg/**/*.svg')
    .pipe(
        svgSprite({
            mode: {
            stack: {
            sprite: '../sprite.svg',
                },
            },
        })
    )
    .pipe(dest('dist/images'));
};

const scripts = () => {
    return src(['src/js/components/**/*.js', 'src/js/main.js'])
        .pipe(gulpif(isDev, sourcemaps.init())) 
        .pipe(babel({
            presets: [[require.resolve('@babel/preset-env')]]
        }))
        .pipe(concat('app.js'))
        .pipe(uglify({
            mangle: isProd,
            compress: isProd,
        }).on('error', notify.onError()))
        .pipe(gulpif(isDev, sourcemaps.write())) 
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
};

const images = () => {
    return src([
        'src/img/**/*.jpg',
        'src/img/**/*.png',
        'src/img/*.svg',
        'src/img/**/*.jpeg',
        'src/img/**/*.webp',
    ])
    .pipe(imagemin())
    .pipe(dest('dist/images'));
};

const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: 'dist',
        }
    });
    if (isDev) {
        watch('src/**/*.html', htmlMinify);
        watch('src/styles/**/*.scss', styles);
        watch('src/img/svg/**/*.svg', svgSprites);
        watch('src/js/**/*.js', scripts);    
        watch('src/resources/**', resources);
        watch('src/fonts/**', fonts);
    }
}

const dev = series(clean, resources, htmlMinify, scripts, fonts, styles, images, svgSprites, watchFiles);
const build = series(clean, resources, htmlMinify, scripts, fonts, styles, images, svgSprites, watchFiles);


exports.build = build;
exports.dev = dev;
exports.default = dev;
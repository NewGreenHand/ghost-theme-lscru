const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');
const path = require('path');
const releaseUtils = require('@tryghost/release-utils');
const inquirer = require('inquirer');

// gulp plugins and utils
const livereload = require('gulp-livereload');
const postcss = require('gulp-postcss');
const zip = require('gulp-zip');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const beeper = require('beeper');
const fs = require('fs');
const less = require('gulp-less');
const rename = require('gulp-rename');

// postcss plugins
const autoprefixer = require('autoprefixer');
const colorFunction = require('postcss-color-function');
const cssnano = require('cssnano');
const customProperties = require('postcss-custom-properties');
const easyimport = require('postcss-easy-import');

const REPO = 'NewGreenHand/ghost-theme-lscru';
const REPO_READONLY = 'NewGreenHand/ghost-theme-lscru';
const CHANGELOG_PATH = path.join(process.cwd(), '.', 'changelog.md');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', 'partials/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function Less(done) {
    pump([
        src([
            'src/assets/less/**/main.less', 
            'src/assets/less/**/*.less'
            ], {sourcemaps: true}),
        concat('style.less'),
        less(),
        postcss([
            easyimport,
            customProperties({preserve: false}),
            colorFunction(),
            autoprefixer(),
            cssnano()
        ]),
        dest('src/assets/css/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function css(done) {
    pump([
        src('src/assets/css/*.css', {sourcemaps: true}),
        concat('style.min.css'),
        postcss([
            easyimport,
            customProperties({preserve: false}),
            colorFunction(),
            autoprefixer(),
            cssnano()
        ]),
        dest('assets/css/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function mainJs(done) {
    pump([
        src([
            // pull in lib files first so our own code can depend on it
            'src/assets/js/jquery.min.js', 
            'src/assets/js/bootstrap.min.js', 
            'src/assets/js/pace.min.js',
            'src/assets/js/main.js'
        ], {sourcemaps: true}),
        concat('index.js'),
        uglify(),
        rename({suffix: '.min'}),
        dest('assets/js/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function postJs(done) {
    pump([
        src([
            'src/assets/js/highlight.pack.js', 
            'src/assets/js/toc.js',
            'src/assets/js/clipboard.min.js', 
            'src/assets/js/post.js'
        ], {sourcemaps: true}),
        concat('post.js'),
        uglify(),
        rename({suffix: '.min'}),
        dest('assets/js/', {sourcemaps: '.'}),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    const filename = require('./package.json').name + '.zip';

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!src', '!src/**',
            '!.gitignore',
            '!gulpfile.js'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

const lessWatcher = () => watch('src/assets/less/**/*.less', parallel(Less, css));
const jsWatcher = () => watch('src/assets/js/**/*.js', parallel(mainJs, postJs));
const cssWatcher = () => watch('src/assets/css/*.css', css);
const hbsWatcher = () => watch(['*.hbs', 'partials/**/*.hbs'], hbs);
const watcher = parallel(lessWatcher, jsWatcher, cssWatcher, hbsWatcher);
const build = series(Less, css, mainJs, postJs);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = series(build, serve, watcher);

exports.release = () => {
    // @NOTE: https://yarnpkg.com/lang/en/docs/cli/version/
    // require(./package.json) can run into caching issues, this re-reads from file everytime on release
    var packageJSON = JSON.parse(fs.readFileSync('./package.json'));
    const newVersion = packageJSON.version;

    if (!newVersion || newVersion === '') {
        console.log(`Invalid version: ${newVersion}`);
        return;
    }

    console.log(`\nCreating release for ${newVersion}...`);

    let config;
    try {
        config = require('./config');
    } catch (err) {
        config = null;
    }

    if (!config || !config.github || !config.github.token) {
        console.log('Please copy config.example.json and configure Github token.');
        return;
    }

    let compatibleWithGhost;

    return inquirer.prompt([{
        type: 'input',
        name: 'compatibleWithGhost',
        message: 'Which version of Ghost is it compatible with?',
        default: '3.0.0'
    }])
    .then(result => {
        compatibleWithGhost = result.compatibleWithGhost;
        return Promise.resolve();
    })
    .then(() => releaseUtils.releases.get({
        userAgent: 'ghost-theme-lscru',
        uri: `https://api.github.com/repos/${REPO_READONLY}/releases`
    }))
    .then((response) => {
        if (!response || !response.length) {
            console.log('No releases found. Skipping...');
            return;
        }

        let previousVersion = response[0].tag_name || response[0].name;
        console.log(`Previous version: ${previousVersion}`);
        return Promise.resolve(previousVersion);
    })
    .then((previousVersion) => {
        const changelog = new releaseUtils.Changelog({
            changelogPath: CHANGELOG_PATH,
            folder: path.join(process.cwd(), '.')
        });

        changelog
            .write({
                githubRepoPath: `https://github.com/${REPO}`,
                lastVersion: previousVersion
            })
            .sort()
            .clean();

        return Promise.resolve();
    })
    .then(() => releaseUtils.releases.create({
        draft: true,
        preRelease: false,
        tagName: newVersion,
        releaseName: newVersion,
        userAgent: 'ghost-theme-lscru',
        uri: `https://api.github.com/repos/${REPO}/releases`,
        github: {
            token: config.github.token
        },
        content: [`**Compatible with Ghost ≥ ${compatibleWithGhost}**\n\n`],
        changelogPath: CHANGELOG_PATH
    }))
    .then((response) => {
        console.log(`\nRelease draft generated: ${response.releaseUrl}\n`);
        return Promise.resolve();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
};

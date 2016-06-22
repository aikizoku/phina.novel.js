/*
 * gruntfile.js
 */

module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json');
    var target = [
        'scripts/script.js',
        'scripts/layer.js',
        'scripts/element.js',

        'scripts/tag/core.js',
        'scripts/tag/text.js',
        'scripts/tag/asset.js',
        'scripts/tag/object.js',
        'scripts/tag/sound.js',
        'scripts/tag/select.js',
    ];
    var banner = '\
/*\n\
 * phina.novel.js <%= version %>\n\
 * http://github.com/phi-jp/phina.novel.js\n\
 * MIT Licensed\n\
 * \n\
 * Copyright (C) 2010 phi, http://tmlife.net\n\
 */\n\
';

    grunt.initConfig({
        version: pkg.version,
        buildDir: ".",

        concat: {
            phina: {
                src: target,
                dest: '<%= buildDir %>/phina.novel.js',
                options: {
                    banner: banner
                }
            },
        },
        uglify: {
            phina: {
                options: {
                },
                files: {
                    '<%= buildDir %>/phina.novel.min.js': [ '<%= buildDir %>/phina.novel.js' ]
                },
            },
        },
    });

    for (var key in pkg.devDependencies) {
        if (/grunt-/.test(key)) {
            grunt.loadNpmTasks(key);
        }
    }

    grunt.registerTask('default', ['concat', 'uglify']);
};


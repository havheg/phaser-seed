
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
    port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

/**
 * Grunt module
 */
module.exports = function (grunt) {

    // Load all required grunt-modules
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /**
         * Set project info
         */
        project: {
            src: 'src',
            game: 'game',
            assets: '<%= project.src %>/assets',
            js: '<%= project.src %>/js/{,*/}*.js',
            phaser: '<%= project.src %>/phaser/build/phaser.min.js'
        },

        tag: {
            banner: '/*!\n' +
                ' * <%= pkg.name %>\n' +
                ' * <%= pkg.title %>\n' +
                ' * <%= pkg.url %>\n' +
                ' * @author <%= pkg.author %>\n' +
                ' * @version <%= pkg.version %>\n' +
                ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
                ' */\n'
        },

        connect: {
            options: {
                port: 9000,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [lrSnippet, mountFolder(connect, 'game')];
                    }
                }
            }
        },

        clean: {
            dist: ['game']
        },

        copy: {
            public: {
                expand: true,
                cwd: 'public/',
                src: '**',
                dest: 'game/'
            },
            assets: {
                expand: true,
                cwd: 'src/assets/',
                src: '**',
                dest: 'game/assets'
            },
            debug: {
                expand: true,
                cwd: 'src/js/',
                src: '**',
                dest: 'game/src'
            },
            phaser: {
                src: '<%= project.phaser %>',
                dest: '<%= project.game %>/phaser.js'
            }
        },

        jshint: {
            files: [
                'Gruntfile.js',
                '<%= project.js %>'
            ],
            options: {

            }
        },

        uglify: {
            options: {
                banner: '<%= tag.banner %>'
            },
            dist: {
                options: {
                    sourceMap: '<%= project.game %>/game.map'
                },
                files: {
                    '<%= project.game %>/game.js': ['<%= project.js %>']
                }
            }
        },

        targethtml: {

            dist: {
                files: {
                    'game/index.html': 'public/index.html'
                }
            },

            debug: {
                files: {
                    'game/index.html': 'public/index.html'
                }
            }
        },

        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },

        watch: {
            alltogether: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: ['<%= project.js %>','<%= project.assets %>/**/*'],
                tasks: ['debug']
            }
        }
    });

    // Default for Dev.
    grunt.registerTask('default', [
        'debug',
        'connect:livereload',
        'open',
        'watch'
    ]);

    // Build for shipping
    grunt.registerTask('build', [
        'clean',
        'jshint',
        'copyfiles',
        'uglify'
    ]);

    // Debug
    grunt.registerTask('debug', [
        'clean',
        'jshint',
        'copydebug'
    ]);

    grunt.registerTask('copyfiles', [
        'targethtml:dist',
        'copy:assets',
        'copy:phaser'
    ]);

    grunt.registerTask('copydebug', [
        'targethtml:debug',
        'copy:debug',
        'copy:assets',
        'copy:phaser'
    ]);

};
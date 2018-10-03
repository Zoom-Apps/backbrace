'use strict';

var path = require('path'),
  merge = require('webpack-merge');

module.exports = function(grunt) {

  //Load grunt modules.
  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('lib/grunt');

  var webpackconfig = require('./webpack.config'),
    versionInfo = require('./lib/version-info/version-info.js');

  //Project configuration.
  grunt.initConfig({

    //Clean directories.
    clean: {
      dist: ['packages/core/dist', 'packages/typings/dist'],
      tmp: ['tmp']
    },

    //Lint javascript.
    eslint: {
      all: {
        src: [
          'packages/core/src/**/*.js',
          'packages/core/test/**/*.js'
        ]
      }
    },

    //Karma tests.
    tests: {
      core: 'karma.conf.js'
    },

    //Auto Karma tests.
    autotest: {
      core: 'karma.conf.js'
    },

    webpack: {
      dev: merge({
        mode: 'development',
        output: {
          path: path.join(__dirname, 'packages/core/dist'),
          publicPath: 'packages/core/dist/',
          library: 'js',
          filename: '[name].js'
        }
      }, webpackconfig),
      prod: merge({
        mode: 'production',
        output: {
          path: path.join(__dirname, 'packages/core/dist'),
          publicPath: 'packages/core/dist/',
          library: 'js',
          filename: '[name].min.js'
        }
      }, webpackconfig)
    },

    'webpack-dev-server': {
      core: {
        webpack: {
          mode: 'none',
          entry: {
            jumpstart: ['./packages/core/src/jumpstart.js']
          },
          devtool: 'source-map',
          devServer: {},
          output: {
            library: 'js',
            filename: '[name].js'
          }
        },
        publicPath: '/scripts',
        contentBase: ['packages/sample', 'packages/backbrace-packages'],
        port: 8000
      }
    },

    jsdoc: {
      dist: {
        src: ['packages/core/src/*.js', 'packages/core/src/*/*.js', 'packages/core/src/*/*/*.js', 'README.md'],
        options: {
          destination: 'docs',
          template: 'node_modules/jumpstartjs-jsdoc-template',
          config: 'jsdoc.conf.json'
        }
      },
      typings: {
        src: [
          'packages/core/src/types.js',
          'packages/core/src/classes/*.js',
          'packages/core/src/components/*.js',
          'packages/core/src/components/*/*.js',
          'packages/core/src/jumpstart.js',
          'packages/core/src/app.js',
          'packages/core/src/code.js',
          'packages/core/src/controller.js',
          'packages/core/src/log.js'
        ],
        options: {
          private: false,
          destination: './packages/typings/dist',
          template: 'node_modules/@jumpstartjs/tsd-jsdoc/dist',
          config: './packages/typings/jsdoc.conf.json'
        }
      }
    },

    file_append: {
      typings: {
        files: [{
          prepend: "/**\n" +
            "* Type definitions for " + versionInfo.currentPackage.name + " v" + versionInfo.currentVersion.full + "\n" +
            "* " + versionInfo.currentPackage.author + "\n" +
            "* Project: " + versionInfo.currentPackage.repository.url + "\n" +
            "* License: " + versionInfo.currentPackage.license + "\n" +
            "* Definitions by: tsd-doc\n" +
            "*/\n\n",
          input: './packages/typings/dist/types.d.ts',
          output: './packages/typings/dist/types.d.ts'
        }]
      }
    },

    subgrunt: {
      packages: {
        options: {
        },
        projects: {
          'packages/backbrace-packages': 'default'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerTask('test', 'Run the unit tests with Karma', [
    'eslint',
    'package',
    'test:core'
  ]);
  grunt.registerTask('test:core', 'Run the unit tests with Karma', ['tests:core']);
  grunt.registerTask('docs', ['jsdoc:dist']);
  grunt.registerTask('typings', [
    'jsdoc:typings',
    'file_append:typings'
  ]);
  grunt.registerTask('generate', 'Generate docs and typings', [
    'docs',
    'typings'
  ]);
  grunt.registerTask('build', [
    'webpack:dev'
  ]);
  grunt.registerTask('webserver', [
    'subgrunt:packages',
    'webpack-dev-server:core'
  ]);
  grunt.registerTask('package', [
    'clean',
    'build',
    'webpack:prod',
    'docs',
    'typings'
  ]);
  grunt.registerTask('default', ['package']);

};

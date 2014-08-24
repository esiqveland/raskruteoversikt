/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    copy: {
        fonts: {
          expand: true,
          cwd: 'public/',
          src: ['**/*.{woff,ttf}'],
          dest: 'dist/css/',
          flatten: true
        },
        templates: {
          expand: true,
          cwd: 'public/',
          src: ['templates/*', 'images/*'],
          dest: 'dist/'
        },
        index: {
          src: 'public/index.html',
          dest: 'dist/index.html'
        },
        android: {
            expand: true,
            cwd: 'public',
            src: ['**'],
            dest: 'app/www'
        },
    },
    useminPrepare: {
      html: 'dist/index.html'
    },
    usemin: {
      html: 'dist/index.html'
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('android', ['copy:android']);
  grunt.registerTask('default',[
    'copy:index',
    'copy:templates',
    'copy:fonts',
    'useminPrepare',
    'concat',
    'uglify',
    'cssmin',
    'usemin'
  ]);

};

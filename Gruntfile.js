/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    copy: {
        android: {
            expand: true,
            cwd: 'public',
            src: ['**'],
            dest: 'app/www'
        }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task.
  grunt.registerTask('android', ['copy:android']);
  grunt.registerTask('default', []);

};

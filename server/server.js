// an entrypoint file that loads esm before running application code.
require = require('esm')(module /*, options*/);

// Import the rest of our application.
module.exports = require('./app.js');

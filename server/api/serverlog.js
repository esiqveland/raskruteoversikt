'use strict';
const raven = require('raven');

const RAVEN_DSN = process.env.RAVEN_DSN;

const client = new raven.Client(RAVEN_DSN);
//raven.patchGlobal(client);

client.on('logged', function(){
  console.log('Yay, it worked!');
});

client.on('error', function (e) {
  // The event contains information about the failure:
  //   e.reason -- raw response body
  //   e.statusCode -- response status code
  //   e.response -- raw http response object

  console.log('uh oh, could not record the event', e);
});

function logRaven() {
  client.captureMessage(arguments, (id, err) => {
    if (err) {
      console.log('Error sending to sentry: ', err);
    }
  });
}

function log() {
  let args = arguments;
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => logRaven(args), 0);
  }
  console.log(args);
}

module.exports = log;

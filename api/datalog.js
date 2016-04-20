const nsq = require('nsqjs');

const defaultOpts = {
  port: 4150,
  host: 'localhost',
};

const init = (opts) => {
  opts = Object.assign({}, defaultOpts, opts);
  console.log('[NSQ] staring nsq with opts: ', opts);

  var w = new nsq.Writer(opts.host, opts.port, opts);

  w.connect();
  var p = new Promise((resolve, reject) => {
    w.on('ready', function () {
      resolve(w);
    });
  });


  w.on('closed', function () {
    console.log('[NSQ] Writer closed');
  });

  w.on('error', function (err) {
    console.log('[NSQ] Error: ', err);
  });

  return p;
};

module.exports = {
  init: init,
};
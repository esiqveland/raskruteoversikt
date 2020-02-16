const defaultOpts = {
  port: 4150,
  host: 'localhost',
};

const init = (opts) => {
  opts = Object.assign({}, defaultOpts, opts);

  return {};
};

module.exports = {
  init: init,
};

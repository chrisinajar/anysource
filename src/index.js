var Url = require('./url');
var after = require('after');
var partial = require('ap').partial;

module.exports = DataSource;

function DataSource (options, symbol) {
  var state = {
    url: Url(options.url, symbol)
  };

  return {
    stop: partial(stop, state)
  };
}

function stop (state, cb) {
  var done = after(1, cb);

  state.url.stop(done);
  // state.url.stop(done);
}

var Collector = require('collect-methods');
var partial = require('ap').partial;
var pole = require('pole');
var request = require('xhr-request');
var isFunction = require('is-function');

module.exports = Url;

function Url (options) {
  if (isFunction(options) || typeof options === 'string') {
    options = {
      url: options
    };
  }
  var state = {
    options: options,
    stopMethods: Collector()
  };

  state.poll = pole({
    interval: options.interval
  }, partial(getData, state));

  state.stopMethods(state.poll.cancel);

  return {
    stop: partial(stop, state),
    onData: state.poll.onData,
    onError: state.poll.onError
  };
}

function stop (state, cb) {
  state.stopMethods();

  cb();
}

function getData (state, cb) {
  var url = state.options.url;
  if (isFunction(url)) {
    url = url();
  }

  request(url, {
    json: !(state.options.json === false)
  }, function (err, data) {
    if (err) {
      return cb(err);
    }
    if (state.options.parse) {
      data = state.options.parse(data);
    }
    cb(null, data);
  });
}

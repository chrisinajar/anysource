var Ws = require('ws');
var gevalify = require('gevalify');
var isFunction = require('is-function');
var Event = require('weakmap-event');
var partial = require('ap').partial;

module.exports = Websocket;

var DataEvent = Event();

function Websocket (options) {
  if (isFunction(options) || typeof options === 'string') {
    options = {
      url: options
    };
  }

  var state = {
    options: options
  };

  state.socket = new Ws(options.url);

  state.openEvent = gevalify(state.socket, 'open');

  if (options.welcome) {
    state.openEvent(function () {
      state.socket.send(JSON.stringify(options.welcome));
    });
  }

  state.socket.on('message', partial(parseMessage, state));

  return {
    onData: partial(DataEvent.listen, state)
  };
}

function parseMessage (state, data) {
  console.log(data);

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) { }
  }

  if (state.options.ignore) {
    var isIgnored = false;
    state.options.ignore.forEach(function (val) {
      if (isIgnored) {
        return;
      }
      var isMatched = true;
      Object.keys(val).forEach(function (key) {
        if (!isMatched) {
          return;
        }

        console.log('checking', val[key], data[key]);
        isMatched = val[key] === data[key];
      });
      isIgnored = isMatched;
    });
    if (isIgnored) {
      return;
    }
  }
  DataEvent.broadcast(state, data);
}

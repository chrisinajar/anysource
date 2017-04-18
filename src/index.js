var Url = require('./url');
var Websocket = require('./websocket');
var Parse = require('./parse');
var after = require('after');
var partial = require('ap').partial;
var Collector = require('collect-methods');
var Event = require('weakmap-event');

module.exports = DataSource;

var DataEvent = Event();

function DataSource (options, symbol) {
  var state = {
    stopMethod: Collector()
  };

  if (options.url) {
    state.url = Url(options.url, symbol);
    state.urlParser = Parse(options.url.parse);
    state.stopMethod(state.url.onData(partial(onData, state, state.urlParser)));
  }

  if (options.websocket) {
    state.websocket = Websocket(options.websocket, symbol);
    state.websocketParser = Parse(options.websocket.parse);
    state.stopMethod(state.websocket.onData(partial(onData, state, state.websocketParser)));
  }

  return {
    stop: partial(stop, state),
    onData: partial(DataEvent.listen, state)
  };
}

function stop (state, cb) {
  var done = after(1, cb);

  state.stopMethod();
  state.url.stop(done);
  // state.url.stop(done);
}

function onData (state, parser, data) {
  data = parser(data);
  DataEvent.broadcast(state, data);
}

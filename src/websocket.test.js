var test = require('tape');
var proxyquire = require('proxyquire');

test('basic websocket functionality', function (t) {
  t.plan(6);
  var options = {
    url: 'wss://some/url',
    welcome: {
      hello: 'indeed'
    },
    ignore: [{
      key: 'ignoreme'
    }]
  };
  var Websocket = proxyquire('./websocket', {
    ws: ws
  });

  function ws (url) {
    t.equals(url, options.url);

    return {
      on: function onOpen (event, fn) {
        switch (event) {
          case 'open':
            t.pass('registers open handler');
            setTimeout(fn);
            break;
          case 'message':
            t.pass('registers message handler');
            sendMessages(fn);
            break;
          default:
            return t.fail('Listened on event we werent expecting, ' + event);
        }
      },
      send: function sendMessage (msg) {
        t.deepEquals(JSON.parse(msg), options.welcome, 'send welcome message');
      }
    };
  }

  var client = Websocket(options);

  client.onData(function (data) {
    t.equal(data.data, 'good', 'ignores bad data');
  });

  t.ok(client, 'returns a client object');

  function sendMessages (handler) {
    setTimeout(function () {
      handler({
        key: 'ignoreme',
        data: 'bad'
      });
      handler({
        key: 'dont ignore me!',
        data: 'good'
      });
    }, 100);
  }
});

var test = require('tape');
var proxy = require('proxyquire');

var data = {
  url: 'http://url.url/url',
  result: 'indeed',
  result2: 'awesome'
};

test('makes requests', function (t) {
  var Url = proxy('./url', {
    'xhr-request': fakeRequest
  });

  t.test('basic client', function (t) {
    testClient(Url({
      url: data.url,
      parse: function (result) {
        t.equals(result, data.result, 'returns data');
        return data.result2;
      }
    }), t);
  });

  t.test('url as a function', function (t) {
    testClient(Url({
      url: function () {
        data.url = data.url + '2';
        return data.url;
      },
      parse: function (result) {
        t.equals(result, data.result, 'returns data');
        return data.result2;
      }
    }), t);
  });

  function testClient (url, t) {
    t.ok(url);

    url.onData(function (result) {
      t.equals(result, data.result2, 'parse works');
      done();
    });
    url.onError(function (err) {
      t.fail(err);
    });

    function done () {
      url.stop(t.end);
    }
  }

  function fakeRequest (url, options, cb) {
    t.equals(url, data.url, 'requests exact url requested');
    setTimeout(function () {
      cb(null, data.result);
    });
  }
});

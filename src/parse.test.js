var test = require('tape');
var Parse = require('./parse');

test('simple obstruction', function (t) {
  var options = {
    type: 'simple',
    keys: {
      indeed: 'awesome'
    }
  };
  var input = {
    awesome: 'it works!'
  };

  t.test('basic parse', function (t) {
    var parse = Parse(options);

    t.deepEquals(parse(input), { indeed: input.awesome }, 'maps basic properties');
    t.end();
  });
  t.test('allows extra values through', function (t) {
    var parse = Parse(options);
    var input = {
      awesome: 'it works!',
      extra: 'still here!'
    };
    var expected = {
      indeed: 'it works!',
      extra: 'still here!'
    };

    t.deepEquals(parse(input), expected, 'lets unspecified values through');
    t.end();
  });
  t.test('lets original value through if you let it', function (t) {
    var parse = Parse({
      type: 'simple',
      keys: {
        awesome: true,
        indeed: 'awesome'
      }
    });
    var input = {
      awesome: 'it works!',
      extra: 'still here!'
    };
    var expected = {
      awesome: input.awesome,
      indeed: input.awesome,
      extra: input.extra
    };

    t.deepEquals(parse(input), expected, 'lets specified values through');
    t.end();
  });
  t.test('supports array sets', function (t) {
    var parse = Parse({
      type: 'simple',
      array: true,
      keys: {
        indeed: 'awesome'
      }
    });
    var input = [{
      awesome: 'it works!',
      extra: 'still here!'
    }, {
      awesome: 'also awesome',
      extra2: 'more extra values'
    }];
    var expected = [{
      indeed: input[0].awesome,
      extra: input[0].extra
    }, {
      indeed: input[1].awesome,
      extra2: input[1].extra2
    }];

    t.deepEquals(parse(input), expected, 'maps array object');
    t.end();
  });
  t.test('chain together parsers', function (t) {
    var parse = Parse([{
      type: 'simple',
      keys: {
        awesome: 'chain'
      }
    }, {
      type: 'simple',
      keys: {
        indeed: 'awesome'
      }
    }]);
    var input = {
      chain: 'it works!',
      extra: 'still here!'
    };
    var expected = {
      indeed: input.chain,
      extra: input.extra
    };

    t.deepEquals(parse(input), expected, 'maps array object');
    t.end();
  });
  t.test('chained in array works', function (t) {
    var parse = Parse([{
      type: 'array'
    }, {
      type: 'simple',
      keys: {
        indeed: 'awesome'
      }
    }]);
    var input = [{
      awesome: 'it works!',
      extra: 'still here!'
    }, {
      awesome: 'also awesome',
      extra2: 'more extra values'
    }];
    var expected = [{
      indeed: input[0].awesome,
      extra: input[0].extra
    }, {
      indeed: input[1].awesome,
      extra2: input[1].extra2
    }];

    t.deepEquals(parse(input), expected, 'array type parser works');
    t.end();
  });
  t.test('array parse dearray', function (t) {
    var parse = Parse([{
      type: 'array'
    }, {
      type: 'simple',
      keys: {
        indeed: 'awesome'
      }
    }, {
      type: 'dearray'
    }, {
      type: 'simple',
      keys: {
        value: '0',
        1: false
      }
    }]);
    var input = [{
      awesome: 'it works!',
      extra: 'still here!'
    }, {
      awesome: 'also awesome',
      extra2: 'more extra values'
    }];
    var expected = {
      value: {
        indeed: input[0].awesome,
        extra: input[0].extra
      }
    };

    t.deepEquals(parse(input), expected, 'dearrays and parses');
    t.end();
  });
});
test('parser types', function (t) {
  t.test('simple', function (t) {
    var parse = Parse({
      type: 'simple',
      keys: {
        indeed: 'awesome'
      }
    });
    var input = {
      awesome: 'it works!',
      extra: 'still here!'
    };
    var expected = {
      indeed: input.awesome,
      extra: input.extra
    };

    t.deepEquals(parse(input), expected, 'simple obstructed values');
    t.end();
  });
  t.test('pluck', function (t) {
    var parse = Parse({
      type: 'pluck',
      key: 'awesome'
    });
    var input = {
      awesome: 'it works!',
      extra: 'still here!'
    };
    var expected = input.awesome;

    t.deepEquals(parse(input), expected, 'maps array object');
    t.end();
  });
  t.test('conditional', function (t) {
    var parse = Parse([{
      type: 'array'
    }, {
      type: 'conditional',
      key: 'awesome',
      default: {
        type: 'pluck',
        key: 'default'
      },
      options: {
        'indeed': {
          type: 'pluck',
          key: 'indeed'
        },
        'other': {
          type: 'pluck',
          key: 'other'
        }
      }
    }]);
    var input = [{
      awesome: 'it works!',
      default: 'default value',
      indeed: 'still here!',
      other: 'other value!'
    }, {
      awesome: 'indeed',
      default: 'default value',
      indeed: 'still here!',
      other: 'other value!'
    }, {
      awesome: 'other',
      default: 'default value',
      indeed: 'still here!',
      other: 'other value!'
    }];

    var expected = [
      input[0].default,
      input[1].indeed,
      input[2].other
    ];

    t.deepEquals(parse(input), expected, 'maps array object');
    t.end();
  });
  t.test('filter', function (t) {
    var parse = Parse([{
      type: 'array'
    }, {
      type: 'conditional',
      key: 'awesome',
      default: {
        type: 'pluck',
        key: 'default'
      },
      options: {
        'indeed': {
          type: 'filter'
        },
        'other': {
          type: 'pluck',
          key: 'other'
        }
      }
    }]);
    var input = [{
      awesome: 'it works!',
      default: 'default value',
      indeed: 'still here!',
      other: 'other value!'
    }, {
      awesome: 'indeed',
      default: 'default value',
      indeed: 'still here!',
      other: 'other value!'
    }, {
      awesome: 'other',
      default: 'default value',
      indeed: 'still here!',
      other: 'other value!'
    }];

    var expected = [
      input[0].default,
      input[2].other
    ];

    t.deepEquals(parse(input), expected, 'maps array object');
    t.end();
  });
});

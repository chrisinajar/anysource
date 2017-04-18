var Obstruction = require('obstruction');
var partial = require('ap').partial;
var extend = require('xtend');
var isArray = require('is-array');

module.exports = Parse;

function Parse (options) {
  if (!options) {
    return (a) => a;
  }
  if (isArray(options)) {
    return joinParsers(options);
  }
  var parse = null;
  switch (options.type) {
    case 'simple':
      parse = partial(basicParse, options);
      break;
    case 'pluck':
      parse = partial(pluckParse, options);
      break;
    case 'conditional':
      parse = partial(conditionalParse, setupConditionalOptions(options));
      break;
    case 'filter':
      parse = partial(filterParse, options);
      break;
    default:
      throw new Error('Unknown type: ' + (options.type || options));
  }

  if (options.array) {
    parse = partial(arrayParser, parse);
  }

  parse = partial(filterFallthrough, parse);

  return parse;
}

function basicParse (options, data) {
  var obsOpts = {};
  Object.keys(data).forEach(function (key) {
    obsOpts[key] = true;
  });
  Object.keys(options.keys).forEach(function (key) {
    var value = options.keys[key];

    if (value === false) {
      delete obsOpts[key];
    } else {
      obsOpts[key] = value;
    }

    if (typeof value === 'string' && obsOpts[value] === true && options.keys[value] !== true) {
      delete obsOpts[value];
    }
  });

  obsOpts = extend(obsOpts);

  var obst = Obstruction(obsOpts);
  return obst(data);
}

function pluckParse (options, data) {
  return data[options.key];
}

function conditionalParse (options, data) {
  var value = data[options.key];

  if (!options.options[value]) {
    if (options.default) {
      return options.default(data);
    }
    return data;
  }

  return options.options[value](data);
}

function setupConditionalOptions (options) {
  if (options.default) {
    options.default = Parse(options.default);
  }
  Object.keys(options.options).forEach(function (key) {
    options.options[key] = Parse(options.options[key]);
  });

  return options;
}

function arrayParser (parseMethod, data) {
  return data
    .map(parseMethod)
    .filter(function (entry) {
      return entry !== filterParse;
    });
}

function joinParsers (optionAr) {
  var arrayed = null;
  return optionAr.reduce(function (memo, val) {
    var type = val.type || val;
    if (type === 'array') {
      arrayed = true;
      return memo;
    }
    if (type === 'dearray') {
      arrayed = false;
      return memo;
    }
    if (val.array === undefined) {
      val.array = arrayed;
    }
    var localParser = Parse(val);

    return function (data) {
      return localParser(memo(data));
    };
  }, (a) => a);
  // return ;
}

function filterParse (state, data) {
  return filterParse;
}

function filterFallthrough (parse, data) {
  if (data === filterParse) {
    return filterParse;
  }

  return parse(data);
}

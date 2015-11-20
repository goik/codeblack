(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":3}],2:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],3:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":2,"FWaASH":5,"inherits":4}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(require,module,exports){
var ImageLoaded = require('./ImageLoaded.js');

function Image(src) {
    'use strict';
    this.src = src;
    this.element = null;

    if (typeof src !== "undefined") {
        this.create();
    }
}

Image.prototype.create = function () {
    'use strict';
    this.element = document.createElement("img");
    this.element.setAttribute("src", this.src);
};

Image.prototype.preload = function (cb) {
    'use strict';
    ImageLoaded(this.element, function(err, alreadyLoaded) {
        cb(err, alreadyLoaded);
    });
};

module.exports = Image;
},{"./ImageLoaded.js":7}],7:[function(require,module,exports){
/*
 * Modified version of http://github.com/desandro/imagesloaded v2.1.1
 * MIT License. by Paul Irish et al.
 */

var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='

function loaded(image, callback) {
    var src
        , old
        , onload

    if (!image.nodeName) return callback(new Error('First argument must be an image element'))
    if (image.nodeName.toLowerCase() !== 'img') return callback(new Error('Element supplied is not an image'))
    if (image.src  && image.complete && image.naturalWidth !== undefined) return callback(null, true)

    old = !image.addEventListener

    function loaded() {
        if (old) {
            image.detachEvent('onload', loaded)
            image.detachEvent('onerror', loaded)
        } else {
            image.removeEventListener('load', loaded, false)
            image.removeEventListener('error', loaded, false)
        }
        callback(null, false)
    }

    if (old) {
        image.attachEvent('onload', loaded)
        image.attachEvent('onerror', loaded)
    } else {
        image.addEventListener('load', loaded, false)
        image.addEventListener('error', loaded, false)
    }

    if (image.readyState || image.complete) {
        src = image.src
        image.src = BLANK
        image.src = src
    }
}

module.exports = loaded

},{}],8:[function(require,module,exports){
var Image = require('./Image.js');

function ImagePreloader(parent) {
    "use strict";
    this.parent = parent;
    this.sources = [];
    this.images = [];
    this.loaded = 0;
    this.deepSearch = true;
}

ImagePreloader.prototype.getImageSrcs = function (element) {
    "use strict";
    this.sources = [];

    if (typeof element !== "undefined") {
        this.findImageInElement(element);

        if (this.deepSearch === true) {
            var elements = element.querySelectorAll("*");
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].tagName !== "SCRIPT") {
                    this.findImageInElement(elements[i]);
                }
            }
        }
    }

    return this.sources;
};

ImagePreloader.prototype.findAndPreload = function (element) {
    "use strict";
    if (typeof element === "undefined") {
        return;
    }

    this.sources = this.getImageSrcs(element);

    for (var i = 0; i < this.sources.length; i++) {
        var image = new Image(this.sources[i]);
        image.preload(this.imageLoaded.bind(this));
        this.images.push(image);
    }
};

ImagePreloader.prototype.imageLoaded = function () {
    "use strict";
    this.loaded++;

    this.updateProgress();
};

ImagePreloader.prototype.updateProgress = function () {
    "use strict";
    this.parent.updateProgress(this.loaded, this.sources.length);
};

ImagePreloader.prototype.findImageInElement = function (element) {
    "use strict";
    var urlType = this.determineUrlAndType(element);

    //skip if gradient
    if (!this.hasGradient(urlType.url)) {
        //remove unwanted chars
        urlType.url = this.stripUrl(urlType.url);

        //split urls
        var urls = urlType.url.split(", ");

        for (var i = 0; i < urls.length; i++) {
            if (this.validUrl(urls[i]) && this.urlIsNew(urls[i])) {
                var extra = "";

                if (this.isIE() || this.isOpera()){
                    //filthy always no cache for IE, sorry peeps!
                    extra = "?rand=" + Math.random();
                }

                //add image to found list
                this.sources.push(urls[i] + extra);
            }
        }
    }
};

ImagePreloader.prototype.determineUrlAndType = function (element) {
    "use strict";
    var url = "";
    var type = "normal";
    var style = element.currentStyle || window.getComputedStyle(element, null);

    if (style.backgroundImage !== "" || element.style.backgroundImage !== "") {
        //if object has background image
        url = (style.backgroundImage || element.style.backgroundImage);
        type = "background";
    } else if (typeof(element.getAttribute("src")) !== "undefined" && element.nodeName.toLowerCase() === "img") {
        //if is img and has src
        url = element.getAttribute("src");
    }

    return {
        url: url,
        type: type
    };
};

ImagePreloader.prototype.hasGradient = function (url) {
    "use strict";
    return url.indexOf("gradient(") !== -1;
};

ImagePreloader.prototype.stripUrl = function (url) {
    "use strict";
    url = url.replace(/url\(\"/g, "");
    url = url.replace(/url\(/g, "");
    url = url.replace(/\"\)/g, "");
    url = url.replace(/\)/g, "");

    return url;
};

ImagePreloader.prototype.validUrl = function (url) {
    "use strict";
    if (url.length > 0 && !url.match(/^(data:)/i)) {
        return true;
    } else {
        return false;
    }
};

ImagePreloader.prototype.urlIsNew = function (url) {
    "use strict";
    return this.sources.indexOf(url) === -1;
};

ImagePreloader.prototype.isIE = function () {
    "use strict";
    return navigator.userAgent.match(/msie/i);
};

ImagePreloader.prototype.isOpera = function () {
    "use strict";
    return navigator.userAgent.match(/Opera/i);
};

module.exports = ImagePreloader;
},{"./Image.js":6}],9:[function(require,module,exports){
function LoadingBar() {
    'use strict';
    this.element = null;
    this.className = "queryloader__overlay__bar";
    this.barHeight = 1;
    this.barColor = "#fff";
}

/**
 * Creates the element for the loadingbar
 */
LoadingBar.prototype.create = function () {
    'use strict';
    this.element = document.createElement("div");
    this.element.setAttribute("class", this.className);
    this.setStyling();
    this.updateProgress(0, 0);
};

LoadingBar.prototype.setStyling = function () {
    'use strict';

    this.element.style.height = this.barHeight + "px";
    this.element.style.marginTop = "-" + (this.barHeight / 2) + "px";
    this.element.style.backgroundColor = this.barColor;
    this.element.style.position = "absolute";
    this.element.style.top = "50%";

    this.setTransitionTime(100);
};

LoadingBar.prototype.updateProgress = function (percentage, time) {
    'use strict';

    if (parseInt(percentage) < 0) {
        percentage = 0;
    } else if (parseInt(percentage) > 100) {
        percentage = 100;
    }

    if (time !== 0) {
        this.setTransitionTime(time);
    }

    this.element.style.width = parseInt(percentage) + "%";
};

LoadingBar.prototype.setTransitionTime = function (ms) {
    "use strict";
    this.element.style.WebkitTransition = "width " + ms + "ms";
    this.element.style.MozTransition = "width " + ms + "ms";
    this.element.style.OTransition = "width " + ms + "ms";
    this.element.style.MsTransition = "width " + ms + "ms";
    this.element.style.Transition = "width " + ms + "ms";
};

module.exports = LoadingBar;
},{}],10:[function(require,module,exports){
function Percentage() {
    'use strict';
    this.element = null;
    this.className = "queryloader__overlay__percentage";
    this.barHeight = 1;
    this.barColor = "#fff";
}

Percentage.prototype.create = function () {
    'use strict';
    this.element = document.createElement("div");
    this.element.setAttribute("class", this.className);
    this.applyStyling();
    this.updateProgress(0, 0);
};

Percentage.prototype.applyStyling = function () {
    'use strict';
    this.element.style.height = "40px";
    this.element.style.width = "100%";
    this.element.style.position = "absolute";
    this.element.style.fontSize = "3em";
    this.element.style.top = "50%";
    this.element.style.left = "0";
    this.element.style.marginTop = "-" + (59 + this.barHeight) + "px";
    this.element.style.textAlign = "center";
    this.element.style.color = this.barColor;
};

Percentage.prototype.updateProgress = function (percentage, time) {
    'use strict';

    if (parseInt(percentage) < 0) {
        percentage = 0;
    } else if (parseInt(percentage) > 100) {
        percentage = 100;
    }

    this.element.innerHTML = parseInt(percentage) + "%";
};

module.exports = Percentage;
},{}],11:[function(require,module,exports){
var LoadingBar = require('./LoadingBar.js');
var Percentage = require('./Percentage.js');

function Overlay(parentElement) {
    'use strict';
    this.parentElement = parentElement;
    this.idName = "qLoverlay";
    this.className = "queryloader__overlay";
    this.element = null;
    this.loadingBar = null;
    this.percentage = null;
    this.barColor = "#ff0000";
    this.backgroundColor = "#000";
    this.barHeight = 1;
    this.fadeOutTime = 300;
    this.showPercentage = false;
}

Overlay.prototype.init = function () {
    "use strict";
    this.create();

    this.loadingBar = new LoadingBar();
    this.loadingBar.barHeight = this.barHeight;
    this.loadingBar.barColor = this.barColor;
    this.loadingBar.create();
    this.element.appendChild(this.loadingBar.element);

    if (this.showPercentage) {
        this.percentage = new Percentage();
        this.percentage.barColor = this.barColor;
        this.percentage.create();
        this.element.appendChild(this.percentage.element);
    }

    this.parentElement.appendChild(this.element);
};

Overlay.prototype.create = function () {
    'use strict';
    this.element = (document.querySelector("#" + this.idName) || document.createElement("div"));
    this.element.setAttribute("class", this.className);
    this.element.setAttribute("id", this.idName);
    this.applyStyling();
};

Overlay.prototype.applyStyling = function () {
    'use strict';
    //determine postion of overlay and set parent position
    this.element.style.position = this.calculatePosition();
    this.element.style.width = "100%";
    this.element.style.height = "100%";
    this.element.style.backgroundColor = this.backgroundColor;
    this.element.style.backgroundPosition = "fixed";
    this.element.style.zIndex = 666999; //very HIGH
    this.element.style.top = "0";
    this.element.style.left = "0";

    this.element.style.WebkitTransition = "opacity " + this.fadeOutTime + "ms";
    this.element.style.MozTransition = "opacity " + this.fadeOutTime + "ms";
    this.element.style.OTransition = "opacity " + this.fadeOutTime + "ms";
    this.element.style.MsTransition = "opacity " + this.fadeOutTime + "ms";
    this.element.style.Transition = "opacity " + this.fadeOutTime + "ms";
};

Overlay.prototype.calculatePosition = function () {
    'use strict';
    var overlayPosition = "absolute";

    if (this.parentElement.tagName.toLowerCase() === "body") {
        overlayPosition = "fixed";
    } else {
        if (this.parentElement.style.position !== "fixed" || this.parentElement.style.position !== "absolute" ) {
            this.parentElement.style.position = "relative";
        }
    }

    return overlayPosition;
};

Overlay.prototype.updateProgress = function (percentage, time) {
    "use strict";
    if (this.loadingBar !== null) {
        this.loadingBar.updateProgress(percentage, time);
    }

    if (this.percentage !== null) {
        this.percentage.updateProgress(percentage, time);
    }
};

Overlay.prototype.remove = function () {
    "use strict";
    this.element.parentNode.removeChild(this.element);
};

module.exports = Overlay;
},{"./LoadingBar.js":9,"./Percentage.js":10}],12:[function(require,module,exports){
var ImagePreloader = require('./ImagePreloader/');
var Overlay = require('./Overlay/');

function QueryLoader(element, options) {
    'use strict';
    this.element = element;
    this.options = options;
    this.done = false;
    this.maxTimeout = null;

    //The default options
    this.defaultOptions = {
        onComplete: function() {},
        backgroundColor: "#000",
        barColor: "#fff",
        overlayId: 'qLoverlay',
        barHeight: 1,
        percentage: false,
        deepSearch: true,
        minimumTime: 300,
        maxTime: 10000,
        fadeOutTime: 1000
    };

    //children
    this.overlay = null;
    this.preloader = null;

    if (element !== null) {
        this.init();
    }
}

QueryLoader.prototype.init = function () {
    'use strict';
    this.options = this.extend(this.defaultOptions, this.options);

    if (typeof this.element !== "undefined") {
        this.createOverlay();
        this.createPreloader();
        this.startMaxTimeout();
    }
};

QueryLoader.prototype.extend = function (base, adding) {
    'use strict';
    if (typeof base === "undefined") {
        base = {};
    }

    for (var property in adding) {
        if (adding.hasOwnProperty(property)) {
            base[property] = adding[property];
        }
    }

    return base;
};

QueryLoader.prototype.startMaxTimeout = function () {
    "use strict";
    this.maxTimeout = window.setTimeout(this.doneLoading.bind(this), this.options.maxTime);
};

QueryLoader.prototype.createOverlay = function () {
    'use strict';
    this.overlay = new Overlay(this.element);
    this.overlay.idName = this.options.overlayId;
    this.overlay.backgroundColor = this.options.backgroundColor;
    this.overlay.barHeight = this.options.barHeight;
    this.overlay.barColor = this.options.barColor;
    this.overlay.showPercentage = this.options.percentage;
    this.overlay.fadeOuttime = this.options.fadeOutTime;

    if (typeof this.element !== "undefined") {
        this.overlay.init();
    }
};

QueryLoader.prototype.createPreloader = function () {
    'use strict';
    this.preloader = new ImagePreloader(this);
    this.preloader.deepSearch = this.options.deepSearch;

    window.setTimeout(function () { this.preloader.findAndPreload(this.element); }.bind(this), 100);
};

QueryLoader.prototype.updateProgress = function (done, total) {
    "use strict";
    this.overlay.updateProgress(((done / total) * 100), this.options.minimumTime);

    if (done === total && this.done === false) {
        window.clearTimeout(this.maxTimeout);
        window.setTimeout(this.doneLoading.bind(this), this.options.minimumTime);
    }
};

QueryLoader.prototype.doneLoading = function () {
    "use strict";
    window.clearTimeout(this.maxTimeout);
    this.done = true;

    this.overlay.element.style.opacity = 0;

    window.setTimeout(this.destroy.bind(this), this.options.fadeOutTime);
};

QueryLoader.prototype.destroy = function () {
    "use strict";
    this.overlay.remove();

    this.options.onComplete();
};

module.exports = QueryLoader;
},{"./ImagePreloader/":8,"./Overlay/":11}],13:[function(require,module,exports){
var assert = require("assert");

var Overlay = require("../src/Overlay/");
var LoadingBar = require("../src/Overlay/LoadingBar.js");
var Percentage = require("../src/Overlay/Percentage.js");
var Image = require("../src/ImagePreloader/Image.js");
var ImagePreloader = require("../src/ImagePreloader/");
var QueryLoader = require("../src/QueryLoader.js");

describe('LoadingBar', function() {
    describe('#create()', function () {
        var lb = new LoadingBar();
        lb.create();

        it('should create an element for itself', function () {
            assert.notEqual(null, lb.element);
            assert.notEqual("undefined", typeof lb.element);
            assert.notEqual("undefined", typeof lb.element.tagName);
            assert.equal("div", lb.element.tagName.toLowerCase());
            assert.equal(lb.className, lb.element.getAttribute("class"));
        });

        it('should apply default styling', function () {
            assert.equal("absolute", lb.element.style.position);
            assert.equal(lb.barHeight + "px", lb.element.style.height);
        });
    });

    describe('#updateProgress()', function () {
        it('should update the progress and adjust the loading bar', function () {
            var lb = new LoadingBar();
            lb.create();

            assert.equal("0%", lb.element.style.width);

            lb.updateProgress(10, 0);

            assert.equal("10%", lb.element.style.width);

            lb.updateProgress(50, 0);

            assert.equal("50%", lb.element.style.width);

            lb.updateProgress(100, 0);

            assert.equal("100%", lb.element.style.width);

            lb.updateProgress(-20, 0);

            assert.equal("0%", lb.element.style.width);

            lb.updateProgress(420, 0);

            assert.equal("100%", lb.element.style.width);
        });

        it('should not break on floats', function () {
            var lb = new LoadingBar();
            lb.create();

            lb.updateProgress(10.6, 0);

            assert.equal("10%", lb.element.style.width);

            lb.updateProgress(50.456, 0);

            assert.equal("50%", lb.element.style.width);
        });
    });
});

describe('Percentage', function() {
    describe('#create()', function () {
        var p = new Percentage();
        p.create();

        it('should create an element for itself', function () {
            assert.notEqual(null, p.element);
            assert.notEqual("undefined", typeof p.element);
            assert.notEqual("undefined", typeof p.element.tagName);
            assert.equal("div", p.element.tagName.toLowerCase());
            assert.equal(p.className, p.element.getAttribute("class"));
        });

        it('should apply default styling', function () {
            assert.equal("absolute", p.element.style.position);
        });
    });

    describe('#updateProgress()', function () {
        var p = new Percentage();
        p.create();

        it('should update the progress and adjust the loading bar', function () {
            assert.equal("0%", p.element.innerHTML);

            p.updateProgress(10, 0);

            assert.equal("10%", p.element.innerHTML);

            p.updateProgress(50, 0);

            assert.equal("50%", p.element.innerHTML);

            p.updateProgress(100, 0);

            assert.equal("100%", p.element.innerHTML);

            p.updateProgress(-20, 0);

            assert.equal("0%", p.element.innerHTML);

            p.updateProgress(420, 0);

            assert.equal("100%", p.element.innerHTML);
        });

        it('should not break on floats', function () {
            p.updateProgress(10.6, 0);

            assert.equal("10%", p.element.innerHTML);

            p.updateProgress(50.456, 0);

            assert.equal("50%", p.element.innerHTML);
        });
    });
});

describe('Overlay', function() {
    var fakeBody = document.createElement("body");

    describe('#create()', function () {
        var o = new Overlay(fakeBody);
        o.create();

        it('should create an element for itself', function () {
            assert.notEqual(null, o.element);
            assert.notEqual("undefined", typeof o.element);
            assert.notEqual("undefined", typeof o.element.tagName);
            assert.equal("div", o.element.tagName.toLowerCase());
            assert.equal(o.className, o.element.getAttribute("class"));
        });
    });

    describe('#calculatePosition()', function () {
        var o = new Overlay();

        it('should give the correct needed position of the overlay', function () {
            o.parentElement = fakeBody;

            assert.equal("fixed", o.calculatePosition());

            var fakeContainer = document.createElement("div");
            fakeContainer.style.position = "static";

            o.parentElement = fakeContainer;

            assert.equal("absolute", o.calculatePosition());
            assert.equal("relative", o.parentElement.style.position);

            o.parentElement.style.position = "absolute";

            assert.equal("absolute", o.calculatePosition());
        });
    });

    describe('#updateProgess()', function () {
        var o = new Overlay();
        o.parentElement = fakeBody;
        o.create();

        o.percentage = new Percentage();
        o.percentage.create();

        o.loadingBar = new LoadingBar();
        o.loadingBar.create();

        it('should update the loading progress of both percentage and loadingbar', function () {
            assert.equal("0%", o.percentage.element.innerHTML);
            assert.equal("0%", o.loadingBar.element.style.width);

            o.updateProgress(10, 0);

            assert.equal("10%", o.percentage.element.innerHTML);
            assert.equal("10%", o.loadingBar.element.style.width);
        });
    });
});

describe('Image', function() {
    describe('#constructor()', function () {
        it('should create an image object with given src', function () {
            var exampleImage = new Image("some/src");

            assert.equal("some/src", exampleImage.src);
        });

        it('should create a dom object with given src', function () {
            var exampleImage = new Image("some/src");

            assert.notEqual(-1, exampleImage.element.src.indexOf("some/src"));
        });
    });

    describe('#preload()', function () {
        it('should callback when an image is loaded', function (done) {
            var exampleImage = new Image("images/1.jpg");

            exampleImage.preload(done);
        });
    });
});

describe('QueryLoader', function() {
    describe('#createOverlay()', function () {
        var ql = new QueryLoader();

        it('should create an overlay when called', function () {
            ql.createOverlay();

            assert.equal(ql.overlay instanceof Overlay, true);
        });
    });

    describe('#createPreloader()', function () {
        var ql = new QueryLoader();

        it('should create the preloader', function () {
            ql.createPreloader();

            assert.equal(ql.preloader instanceof ImagePreloader, true);
        });
    });

    describe('#extend()', function () {
        it('should merge two objects', function () {
            var ql = new QueryLoader();

            var destination = {
                some: "thing",
                is: "not",
                right: "man"
            };

            var source = {
                some: "one",
                right: "dude"
            };

            assert.deepEqual({
                "some": "one",
                "is": "not",
                "right": "dude"
            }, ql.extend(destination, source));
        });
    });
});

describe('ImagePreloader', function() {
    "use strict";
    describe('#getImageSrcs()', function () {
        var ip = new ImagePreloader();

        var fakeImagesContainer = document.createElement("div");

        var img1 = document.createElement("img");
        img1.setAttribute("src", "fakeimg1.png");
        fakeImagesContainer.appendChild(img1);

        var img2 = document.createElement("img");
        img2.setAttribute("src", "fakeimg2.png");
        fakeImagesContainer.appendChild(img2);

        var img3 = document.createElement("section");
        img3.style.backgroundImage = "url(fakeimg3.png)";
        fakeImagesContainer.appendChild(img3);

        var img4 = document.createElement("section");
        img4.style.backgroundImage = "linear-gradient(left, #fff, #eee)";
        fakeImagesContainer.appendChild(img4);

        var img5 = document.createElement("section");
        img5.style.background = "url(fakeimg5.png)";
        fakeImagesContainer.appendChild(img5);

        it('should get all images within the given element', function () {
            var images = ip.getImageSrcs(fakeImagesContainer);

            assert.equal(4, images.length);
            assert.notEqual(-1, images[0].indexOf("fakeimg1.png"));
            assert.notEqual(-1, images[1].indexOf("fakeimg2.png"));
            assert.notEqual(-1, images[2].indexOf("fakeimg3.png"));
            assert.notEqual(-1, images[3].indexOf("fakeimg5.png"));
        });
    });

    describe('#hasGradient()', function () {
        var ip = new ImagePreloader();

        it('should check if given url has a gradient', function () {
            assert.equal(false, ip.hasGradient("hasnogradienthere.png"));
            assert.equal(false, ip.hasGradient("grasdfsadg"));
            assert.equal(true, ip.hasGradient("linear-gradient(left, #fff, #fff)"));
        });
    });

    describe('#stripUrl()', function () {
        var ip = new ImagePreloader();

        it('should strip the url() part from given src', function () {
            assert.equal(-1, ip.stripUrl("url(this/path/file.png)").indexOf("url"));
            assert.equal(-1, ip.stripUrl("file.png").indexOf("url"));
        });
    });

    describe('#validUrl()', function () {
        var ip = new ImagePreloader();

        it('should check if given url is valid', function () {
            assert.equal(false, ip.validUrl(""));
            assert.equal(false, ip.validUrl("data:blablabla"));
            assert.equal(true, ip.validUrl("/this/is/valid.png"));
        });
    });

    describe('#urlIsNew()', function () {
        var ip = new ImagePreloader();
        ip.sources = ["test.png", "something.png", "image.jpg"];

        it('should check if given url is new in this.images', function () {
            assert.equal(false, ip.urlIsNew("image.jpg"));
            assert.equal(true, ip.urlIsNew("new.png"));
        });
    });
});
},{"../src/ImagePreloader/":8,"../src/ImagePreloader/Image.js":6,"../src/Overlay/":11,"../src/Overlay/LoadingBar.js":9,"../src/Overlay/Percentage.js":10,"../src/QueryLoader.js":12,"assert":1}]},{},[13])
var util = require('util');
var isNull = function(obj) {
  return (typeof obj === 'undefined') || (obj === null);
};
var hasProp = function(obj, name) {
  return !isNull(obj) && Object.hasOwnProperty(obj, name);
};


module.exports.check = {
  nil: isNull,
  has: hasProp,
  exists: function(obj) { return !isNull(obj); }
};

module.exports.isString = function(obj) {
  return !isNull(obj) && (typeof obj === 'string');
};

module.exports.isFunction = function(obj) {
  return !isNull(obj) && (typeof obj === 'function');
};

module.exports.isEmptyArray = function(obj) {
  return util.isArray(obj) && obj.length === 0;
};

module.exports.format = util.format;
module.exports.print = util.print;
module.exports.puts = util.puts;
module.exports.debug = util.debug;
module.exports.error = util.error;
module.exports.inspect = util.inspect;
module.exports.isArray = util.isArray;
module.exports.isRegExp = util.isRegExp;
module.exports.isDate = util.isDate;
module.exports.isError = util.isError;
module.exports.log = util.log;
module.exports.exec = util.exec;
module.exports.pump = util.pump;
module.exports.inherits = util.inherits;

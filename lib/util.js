var util = require('util'),
    _und = require('underscore');

/*
 * Returns true if the specified object is not null or undefined.
 */
module.exports.exists = function(obj) {
    return !module.exports.nil(obj);
};

/*
 * Returns true if the specified object is null or undefined.
 */
module.exports.nil = function(obj) {
    return module.exports.isNull(obj) || module.exports.isUndefined(obj);
};

/*
 * Returns a function with the specified arguments prefilled in.
 */
module.exports.curry = function(obj, args) {
    return module.exports.bind(obj, null, args);
};

/*
 * Returns a unique numeric value.
 */
module.exports.uniqInt = function() {
    return Math.round(new Date().valueOf() * (1 + Math.random()));
};

/*
 * Returns a unique string value.
 */
module.exports.uniqStr = function() {
    return module.exports.uniqInt() + '';
};

var cont = function(arr, index, end, fn) {
        if (index >= arr.length) {
            if (module.exports.isFunction(end)) { 
                end();
            }
        } else {
            fn(arr[index], function() { 
                cont(arr, index + 1, end, fn);
            });
        }
    };

/*
 * Iterates through an array asynchronously passing a continuation on each element.
 * - endfn will be called when there are no more elements in the array
 * - example call
 *   util.cont(arr, endfn, function(item, cont) {
 *     // do something with item
 *     cont();
 *   });
 */
module.exports.cont = function(arr, end, fn) {
    cont(arr, 0, end, fn);
};

/*
 * Converts the given array into a hash map where the keys are 
 * the items of the array (converted to string with the specified function)
 * and the values are given by the toVal function or set to true.
 */
module.exports.toHash = function(arr, toStr, toVal) {
    var hash = {};
    arr.forEach(function(obj) {
        var key   = module.exports.isFunction(toStr) ? toStr(obj) : obj;
        hash[key] = module.exports.isFunction(toVal) ? toVal(obj) : true;
    });
    return hash;
};

module.exports.take = function(obj, count) {
    var nil     = module.exports.nil,
        isArray = module.exports.isArray;

    if (nil(obj) || !isArray(obj)) { return []; }

    return obj.slice(0, count);
};

module.exports.skip = function(obj, count) {
    var nil     = module.exports.nil,
        isArray = module.exports.isArray;

    if (nil(obj) || !isArray(obj)) { return []; }

    return obj.slice(count, obj.length);
};

_und.mixin({
    take: module.exports.take,
    skip: module.exports.skip
});

/*
 * base util functions
 */
module.exports.format   = util.format;
module.exports.print    = util.print;
module.exports.puts     = util.puts;
module.exports.debug    = util.debug;
module.exports.error    = util.error;
module.exports.inspect  = util.inspect;
module.exports.isArray  = util.isArray;
module.exports.isRegExp = util.isRegExp;
module.exports.isDate   = util.isDate;
module.exports.isError  = util.isError;
module.exports.log      = util.log;
module.exports.exec     = util.exec;
module.exports.pump     = util.pump;
module.exports.inherits = util.inherits;

/*
 * underscore core
 */
module.exports.each         = _und.each;
module.exports.map          = _und.map;
module.exports.reduce       = _und.reduce;
module.exports.reduceRight  = _und.reduceRight;
module.exports.find         = _und.find;
module.exports.filter       = _und.filter;
module.exports.reject       = _und.reject;
module.exports.all          = _und.all;
module.exports.any          = _und.any;
module.exports.include      = _und.include;
module.exports.invoke       = _und.invoke;
module.exports.pluck        = _und.pluck;
module.exports.max          = _und.max;
module.exports.min          = _und.min;
module.exports.sortBy       = _und.sortBy;
module.exports.groupBy      = _und.groupBy;
module.exports.sortedIndex  = _und.sortedIndex;
module.exports.shuffle      = _und.shuffle;
module.exports.toArray      = _und.toArray;
module.exports.size         = _und.size;

/*
 * underscore arrays
 */
module.exports.first        = _und.first;
module.exports.initial      = _und.initial;
module.exports.last         = _und.last;
module.exports.rest         = _und.rest;
module.exports.compact      = _und.compact;
module.exports.flatten      = _und.flatten;
module.exports.without      = _und.without;
module.exports.union        = _und.union;
module.exports.intersection = _und.intersection;
module.exports.difference   = _und.difference;
module.exports.uniq         = _und.uniq;
module.exports.zip          = _und.zip;
module.exports.indexOf      = _und.indexOf;
module.exports.lastIndexOf  = _und.lastIndexOf;
module.exports.range        = _und.range;

/*
 * underscore functions
 */
module.exports.bind         = _und.bind;
module.exports.bindAll      = _und.bindAll;
module.exports.memoize      = _und.memoize;
module.exports.delay        = _und.delay;
module.exports.defer        = _und.defer;
module.exports.throttle     = _und.throttle;
module.exports.debounce     = _und.debounce;
module.exports.once         = _und.once;
module.exports.after        = _und.after;
module.exports.wrap         = _und.wrap;
module.exports.compose      = _und.compose;

/*
 * underscore objects
 */
module.exports.keys         = _und.keys;
module.exports.values       = _und.values;
module.exports.functions    = _und.functions;
module.exports.extend       = _und.extend;
module.exports.defaults     = _und.defaults;
module.exports.clone        = _und.clone;
module.exports.tap          = _und.tap;
module.exports.has          = _und.has;
module.exports.isEqual      = _und.isEqual;
module.exports.isEmpty      = _und.isEmpty;
module.exports.isElement    = _und.isElement;
module.exports.isArguments  = _und.isArguments;
module.exports.isFunction   = _und.isFunction;
module.exports.isString     = _und.isString;
module.exports.isNumber     = _und.isNumber;
module.exports.isBoolean    = _und.isBoolean;
module.exports.isNaN        = _und.isNaN;
module.exports.isNull       = _und.isNull;
module.exports.isUndefined  = _und.isUndefined;

/*
 * underscore utility
 */
module.exports.noConflict   = _und.noConflict;
module.exports.identity     = _und.identity;
module.exports.times        = _und.times;
module.exports.mixin        = _und.mixin;
module.exports.uniqueId     = _und.uniqueId;
module.exports.escape       = _und.escape;
module.exports.template     = _und.template;

/*
 * underscore chaining
 */
module.exports.chain        = _und.chain;
module.exports.value        = _und.value;

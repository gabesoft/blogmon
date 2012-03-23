/*
 * function utilities
 */

var util = require('./util.js'),
    ctor = function() {},
    nativeBind = Function.prototype.bind,
    slice = Array.prototype.slice;

module.exports = {
    bind: function bind(func, scope) {
        var bound, args;
        if (func.bind === nativeBind && nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        if (!util.isFunction(func)) {
            throw new TypeError();
        }
        args = slice.call(arguments, 2);
        bound = function() {
            var self, result;
            if (!(this instanceof bound)) {
                return func.apply(scope, args.concat(slice.call(arguments)));
            }
            ctor.prototype = func.prototype;
            self = new ctor();
            result = func.apply(self, args.concat(slice.call(arguments)));
            return Object(result) === result ? result : self;
        };
        return bound;
    },

    curry: function(fn) {
        var args = slice.apply(arguments, [1]);
        return function() {
            return fn.apply(null, args.concat(slice.apply(arguments)));
        };
    }
};

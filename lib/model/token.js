var util   = require('../util.js'),
    trav   = require('traverse'),
    eyes   = require('eyes'),
    crypto = require('crypto');

function Token (redis) {
    if (!(this instanceof Token)) { return new Token(redis); }
    this.redis = redis;
}

module.exports = Token;

var tokenKey = function(name, series) {
    return 'token:' + name + ':' + series;
};

var unique = function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
};

var tohex = function(text) {
    return crypto
       .createHash('sha1')
       .update(text)
       .digest('hex');
};

var parse = function(str) {
    return JSON.parse(str, function(k, v) {
        return (k === 'date') ? new Date(v) : v;
    });
};

var tostr = function(token) {
    return JSON.stringify(token);
};

Token.prototype.create = function(name, callback) {
    var token = {
        id    : tohex(unique()),
        series: tohex(unique()),
        name  : name,
        date  : new Date()
    };
    var redis  = this.redis,
        key    = tokenKey(token.name, token.series);

    redis.set(key, tostr(token), function(err) {
        callback(err, token);
    });
};

Token.prototype.update = function(token, callback) {
    var redis  = this.redis,
        key    = tokenKey(token.name, token.series),
        copy   = trav(token).clone();
    copy.id = tohex(unique());
    redis.set(key, tostr(copy), function(err) {
        callback(err, copy);
    });
};

Token.prototype.remove = function(token, callback) {
    var redis  = this.redis,
        key    = tokenKey(token.name, token.series);
    redis.del(key, function(err, count) {
        callback(err, count);
    });
};

Token.prototype.verify = function(token, callback) {
    var redis = this.redis,
        key   = tokenKey(token.name, token.series);
    redis.get(key, function(err, data) {
        var saved, match;
        if (util.nil(data)) { 
            callback(err, null);
        } else {
            saved = parse(data);
            match = saved.id === token.id;
            if (match) {
                callback(err, saved);
            } else {
                callback(new Error('possible identity theft detected'), null);
            } 
        }
    });
};

Token.prototype.removeAll = function(name, callback) {
    var redis  = this.redis,
        multi  = redis.multi(),
        keypat = tokenKey(name, '*');

    redis.keys(keypat, function(err1, keys) {
        keys.forEach(function(key) {
            multi.del(key);
        });
        multi.exec(function(err2, deleted) {
            callback([err1, err2], deleted.length);
        });
    });
};

Token.prototype.count = function(name, callback) {
    var redis  = this.redis,
        keypat = tokenKey(name, '*');
    redis.keys(keypat, function(err, keys) {
        callback(err, keys.length);
    });
};

Token.prototype.parse = parse;
Token.prototype.tostr = tostr;

var NAMES  = 'user:name',
    util   = require('../util.js'),
    crypto = require('crypto');

function User (redis) {
    if (!(this instanceof User)) { return new User(redis); }
    this.redis = redis;
}

module.exports = User;

var getKey = function(name) { 
    return 'user:name:' + name;
};

var getFeedsKey = function(name) {
    return 'user:feeds:' + name;
};

var getsalt = function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
};

var encrypt = function(text, salt) {
    return crypto
       .createHmac('sha1', salt)
       .update(text)
       .digest('hex');
};

User.prototype.authenticate = function(name, pass, callback) {
    this.get(name, function(err, user) {
        var encrypted;

        if (util.nil(user)) {
            callback(err, user);
        } else {
            encrypted = encrypt(pass, user.salt);
            callback(err, user.pass === encrypted ? user : null);
        }
    });
};

User.prototype.create = function(name, pass, callback) {
    var key   = getKey(name),
        redis = this.redis,
        salt  = getsalt(),
        user;

    redis.sadd(NAMES, name, function(nerr, added) {
        if (added === 0) {
            callback(new Error('A user with name ' + name + ' already exists'), null);
        } else {
            user = {
                name: name,
                salt: salt,
                pass: encrypt(pass, salt)
            };
            redis.set(key, JSON.stringify(user), function(serr, res) {
                callback(serr, user);
            });
        }
    });
};

User.prototype.subscribe = function(name, feed, callback) {
    var key   = getFeedsKey(name),
        me    = this,
        redis = me.redis;
    redis.sadd(key, feed, function(err, added) {
        me.feeds(name, callback);
    });
};

User.prototype.unsubscribe = function(name, feed, callback) {
    var key   = getFeedsKey(name),
        me    = this,
        redis = me.redis;
    redis.srem(key, feed, function(err, added) {
        me.feeds(name, callback);
    });
};

User.prototype.feeds = function(name, callback) {
    var key   = getFeedsKey(name),
        redis = this.redis;
    redis.smembers(key, function(err, feeds) {
        callback(err, feeds);
    });
};

User.prototype.get = function(name, callback) {
    var key   = getKey(name), 
        me    = this,
        redis = this.redis;

    redis.get(key, function(err1, data) {
        if (util.nil(data)) {
            callback(null, null);
        } else {
            me.feeds(name,  function(err2, feeds) {
                var user = JSON.parse(data);
                user.feeds = feeds;
                callback(err1, user);
            });
        }
    });
};

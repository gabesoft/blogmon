var NAMES  = 'user:name'
  , util   = require('../util.js')
  , events = require('events')
  , crypto = require('crypto')

  , getKey = function(name) { 
        return util.str.sprintf('user:name:%s', name);
    }

  , getFeedsKey = function(name) {
        return util.str.sprintf('user:feeds:%s', name);
    }

  , getsalt = function() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }

  , encrypt = function(text, salt) {
        return crypto
           .createHmac('sha1', salt)
           .update(text)
           .digest('hex');
    };

function User (redis) {
    if (!(this instanceof User)) { return new User(redis); }
    this.redis = redis;
}

module.exports = User;

User.prototype.authenticate = function(name, pass, callback) {
    this.get(name, function(user) {
        var encrypted;

        if (util.nil(user)) {
            callback(user);
        } else {
            encrypted = encrypt(pass, user.salt);
            callback(user.pass === encrypted ? user : null);
        }
    });
};

User.prototype.create = function(name, pass, callback) {
    var key   = getKey(name)
      , redis = this.redis
      , salt  = getsalt()
      , user;

    redis.sadd(NAMES, name, function(nerr, added) {
        if (added === 0) {
            var text    = 'A user with name %s already exists'
              , message = util.str.sprintf(text, name);
            callback(new Error(message), null);
        } else {
            user = {
                name: name,
                salt: salt,
                pass: encrypt(pass, salt)
            };
            redis.set(key, JSON.stringify(user), function(serr, res) {
                callback(null, user);
            });
        }
    });
};

User.prototype.names = function(callback) {
    this.redis.smembers(NAMES, function(err, names) {
      callback(names);
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
        callback(feeds);
    });
};

User.prototype.get = function(name, callback) {
    var key   = getKey(name), 
        me    = this,
        redis = this.redis;

    redis.get(key, function(err, data) {
        if (util.nil(data)) {
            callback(null, null);
        } else {
            me.feeds(name,  function(feeds) {
                var user = JSON.parse(data);
                user.feeds = feeds;
                callback(user);
            });
        }
    });
};

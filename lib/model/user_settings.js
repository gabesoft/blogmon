var util = require('../util.js')
  , eyes = require('eyes');

function UserSettings (redis, userId) {
    if (!(this instanceof UserSettings)) { return new UserSettings(redis, userId); }

    this.redis  = redis;
    this.getKey = function(type) {
        return util.str.sprintf('settings:user:%s:%s', userId, type);
    };
}

module.exports = UserSettings;

UserSettings.prototype.set = function(type, id, settings, callback) {
    var redis = this.redis
      , key   = this.getKey(type)
      , data  = JSON.stringify(settings);

    redis.hset(key, id, data, function(err, res) {
        callback(res);
    });
};

UserSettings.prototype.get = function(type, id, callback) {
    var redis = this.redis
      , key   = this.getKey(type)
      , hash  = {};

    if (util.exists(id)) {
        redis.hget(key, id, function(err, res) {
            callback(JSON.parse(res));
        });
    } else {
        redis.hgetall(key, function(err, res) {
            Object
               .keys(res)
               .forEach(function(k) {
                    hash[k] = JSON.parse(res[k]);
                });
            callback(hash);
        });
    }
};

UserSettings.prototype.setPostSettings = function(guid, settings, callback) {
    this.set('post', guid, settings, callback);
};

UserSettings.prototype.getPostSettings = function(guid, callback) {
    this.get('post', guid, callback);
};

UserSettings.prototype.getAllPostSettings = function(callback) {
    this.get('post', null, callback);
};

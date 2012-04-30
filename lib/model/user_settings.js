var util       = require('../util.js');

function UserSettings (redis, userId) {
    if (!(this instanceof UserSettings)) { return new UserSettings(redis, userId); }
    this.redis    = redis;
    this.postsKey = util.str.sprintf('settings:user:%s:post', userId);
}

module.exports = UserSettings;

UserSettings.prototype.setPostSettings = function(guid, setting, callback) {
    var redis = this.redis
      , key   = this.postsKey
      , data  = JSON.stringify(setting);

    redis.hset(key, guid, data, function(err, res) {
        callback(res);
    });
};

UserSettings.prototype.getPostSetting = function(guid, callback) {
    var redis = this.redis
      , key   = this.postsKey;

    redis.hget(key, guid, function(err, res) {
        callback(JSON.parse(res));
    });
};

UserSettings.prototype.getAllPostSettings = function(callback) {
    var redis = this.redis
      , multi = redis.multi()
      , key   = this.postsKey;

    redis.hkeys(key, function(err, res) {
        res.forEach(function(guid) {
            multi.hget(key, guid);
        });

        multi.exec(function(err, data) {
            callback(data.map(JSON.parse));
        });
    });
};

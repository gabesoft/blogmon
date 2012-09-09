var util     = require('../util.js')
  , eyes     = require('eyes')
  , getField = function(name, id) {
        return util.str.sprintf('%s:%s', name, id);
    }
  , getFeedKey = function(userId, id) {
        return util.str.sprintf('settings:feed:%s:%s', userId, id);
    }
  , getCountKey = function(userId) {
        return util.str.sprintf('settings:unread-count:%s', userId);
    }
  , parseField = function(input) {
        var pat = /^(\w+):([\s\S]+)$/   // multi-line match
          , mat = pat.exec(input);
        return { name: mat[1], id: mat[2] };
    }
  , params = function(config) {
        var res = { 
                type : null
              , name : 'settings' 
              , id   : null
              , value: null
            };

        util.extend(res, config);

        if (util.nil(res.type)) {
            throw new Error('a settings type must be specified');
        }

        res.id    = util.isArray(res.id) ? res.id : [res.id];
        res.value = util.isArray(res.value) 
            ? res.value 
            : res.id.map(function () { return res.value; });

        return res;
    }
  , getOne = function(redis, key, id, name, callback) {
        var field = getField(name, id)
          , obj   = {};
        redis.hget(key, field, function(err, res) {
            obj[name] = JSON.parse(res);
            util.call(callback, obj);
        });
    }
  , getAll = function(redis, key, callback) {
        var all = {};
        redis.hgetall(key, function(err, res) {
            Object
               .keys(res)
               .forEach(function(k) {
                    var field = parseField(k)
                      , id = field.id
                      , name = field.name;
                    all[id] = util.nil(all[id]) ? {} : all[id];
                    all[id][name] = JSON.parse(res[k]);
                });
            util.call(callback, all);
        });
    };

function UserSettings (redis, userId) {
    if (!(this instanceof UserSettings)) { return new UserSettings(redis, userId); }

    this.redis  = redis;
    this.userId = userId;
    this.getKey = function(type) {
        return util.str.sprintf('settings:user:%s:%s', userId, type);
    };
}

module.exports = UserSettings;

UserSettings.prototype.set = function(config, callback) {
    var args   = params(config)
      , redis  = this.redis
      , multi  = redis.multi()
      , key    = this.getKey(args.type)
      , fields = args.id.map(function (id) { return getField(args.name, id); })
      , values = args.value
      , i      = 0
      , len    = fields.length;

    for (i = 0; i < len; i += 1) {
        if (util.exists(values[i])) {
            multi.hset(key, fields[i], JSON.stringify(values[i]));
        } else {
            multi.hdel(key, fields[i]);
        }
    }

    multi.exec(function(err, res) {
        util.call(callback, res);
    });
};

UserSettings.prototype.get = function(type, id, name, callback) {
    if (util.isFunction(name)) {
        callback = name;
        name     = 'settings';
    }

    var redis = this.redis
      , key   = this.getKey(type)
      , hash  = {};

    if (util.exists(id)) {
        getOne(redis, key, id, name, callback);
    } else {
        getAll(redis, key, callback);
    }
};

UserSettings.prototype.getAll = function(type, callback) {
    this.get(type, null, callback);
};

UserSettings.prototype.setUnread = function(feedId, posts, value, callback) {
    var redis  = this.redis
      , userId = this.userId;

    this.set({
        type : 'post'
      , name : 'unread'
      , id   : posts
      , value: value ? true : null
    }, function(res) {
        var count = util.foldl(res, function(acc, x) { return acc + (value ? x : -x); }, 0)
          , fkey  = getFeedKey(userId, feedId)
          , ckey  = getCountKey(userId)
          , cbfn  = function(err, res) {
                util.call(callback);
            }
          , updateFeedSet = function() {
                if (value) {
                    redis.sadd(fkey, posts, cbfn); 
                } else {
                    redis.srem(fkey, posts, cbfn);
                }
            };

        redis.hincrby(ckey, feedId, count, function(err, res) {
            if (res < 0) {
                redis.hset(ckey, feedId, 0, updateFeedSet);
            } else {
                updateFeedSet();
            }
        });
    });
};

UserSettings.prototype.markUnread = function(feedId, posts, callback) {
    this.setUnread(feedId, posts, true, callback);
};

UserSettings.prototype.markRead = function(feedId, posts, callback) {
    this.setUnread(feedId, posts, false, callback);
};

UserSettings.prototype.countUnread = function(callback) {
    var redis = this.redis
      , key   = getCountKey(this.userId);

    redis.hgetall(key, function(err, res) {
        var counts = {};
        Object
           .keys(res)
           .forEach(function(k) {
                counts[k] = parseInt(res[k], 10);
            });
        util.call(callback, counts);
    });
};

UserSettings.prototype.clearUnread = function(feedId, callback) {
    var me    = this
      , redis = me.redis
      , key   = getFeedKey(me.userId, feedId);

    redis.smembers(key, function(err, posts) {
        me.setUnread(feedId, posts, false, callback);
    });
};

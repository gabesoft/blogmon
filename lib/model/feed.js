var LKP_KEY = 'feed:lookup:uri'
  , util    = require('../util.js')
  , url     = require('url')
  , isDate  = util.toHash([ 'pubdate', 'date', 'pubDate' ])

  , getKey = function(id) {
        return 'feed:id:' + id;
    }

  , parse = function(str) {
        return JSON.parse(str, function(k, v) {
            return isDate[k] ? new Date(v) : v;
        });
    }

  , toStr = function(token) {
        return JSON.stringify(token);
    }

  , addOne = function(repo, feed, callback) {
        var redis = repo.redis;
        redis.hget(LKP_KEY, feed.uri, function(err, existing) {
            var id  = util.uniqInt()
              , key = getKey(id);

            if (util.nil(existing)) {
                feed.id = id;
                redis.set(key, toStr(feed), function(err) {
                    redis.hset(LKP_KEY, feed.uri, id, callback);
                });
            } else {
                feed.id = parseInt(existing, 10);
                repo.update(feed, callback);
            }
        });
    }

  , addMany = function(repo, feeds, callback) {
        var errors = [],
            done   = function() { callback(errors); };
        util.cont(feeds, done, function(feed, cont) {
            addOne(repo, feed, function(err) {
                errors.push(err);
                cont();
            });
        });
    }

  , getByKeys = function(redis, keys, callback) {
        var multi = redis.multi();

        keys
           .filter(function(key)  { return !util.nil(key); })
           .forEach(function(key) { multi.get(key); });

        multi.exec(function(err, res) {
            callback(res.map(parse));
        });
    }

  , isId = function(obj) {
        return util.isNumber(obj) || /^[0-9]+$/.test(obj);
    }

  , isNotId = function(obj) { return !isId(obj); }

  , get = function(redis, objs, callback) {
        var ids   = objs.filter(isId),
            uris  = objs.filter(isNotId),
            multi = redis.multi();

        if (uris.length > 0) {
            uris.forEach(function(uri) {
                multi.hget(LKP_KEY, uri);
            });
            multi.exec(function(err, res) {
                getByKeys(redis, ids.concat(res).map(getKey), callback);
            });
        } else if (objs.length === 0) {
            redis.keys(getKey('*'), function(err, keys) {
                getByKeys(redis, keys, callback);
            });

        } else {
            getByKeys(redis, ids.map(getKey), callback);
        }
    };

function Feed (redis) {
    if (!(this instanceof Feed)) { return new Feed(redis); }
    this.redis = redis;
}

module.exports = Feed;

Feed.prototype.add = function(obj, callback) {
    if (util.nil(obj)) {
        callback();
    } else if (util.isArray(obj)) {
        addMany(this, obj, callback);
    } else {
        addOne(this, obj, callback);
    }
};

Feed.prototype.get = function(obj, callback) {
    if (util.isFunction(obj)) {
        get(this.redis, [], obj);
    } else if (util.isArray(obj)) {
        get(this.redis, obj, callback);
    } else {
        get(this.redis, [obj], function(res) {
            callback(res[0]);
        });
    }
};

Feed.prototype.update = function(feed, callback) {
    var key   = getKey(feed.id),
        redis = this.redis;
    if (util.nil(feed.id)) {
        this.add(feed, callback);
    } else {
        redis.set(key, toStr(feed), callback);
    }
};

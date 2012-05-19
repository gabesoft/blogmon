var util   = require('../util.js')
  , url    = require('url')
  , isDate = util.toMap([ 'pubdate', 'date', 'pubDate' ])

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

  , update = function(redis, feed, callback) {
        redis.set(getKey(feed.id), toStr(feed), callback);
    }

  , addOne = function(redis, feed, callback) {
        feed.id = feed.uri;
        update(redis, feed, callback);
    }

  , addMany = function(redis, feeds, callback) {
        var errors = []
          , done   = function() { 
                util.call(callback, errors);
            };
        util.cont(feeds, done, function(feed, cont) {
            addOne(redis, feed, function(err) {
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
            util.call(callback, res.map(parse));
        });
    }

  , get = function(redis, uris, callback) {
        var multi = redis.multi();

        if (uris.length > 0) {
            getByKeys(redis, uris.map(getKey), callback);
        } else {
            redis.keys(getKey('*'), function(err, keys) {
                getByKeys(redis, keys, callback);
            });
        } 
    };

function Feed (redis) {
    if (!(this instanceof Feed)) { return new Feed(redis); }
    this.redis = redis;
}

module.exports = Feed;

Feed.prototype.add = function(obj, callback) {
    if (util.nil(obj)) {
        util.call(callback);
    } else if (util.isArray(obj)) {
        addMany(this.redis, obj, callback);
    } else {
        addOne(this.redis, obj, callback);
    }
};

Feed.prototype.get = function(obj, callback) {
    if (util.isFunction(obj)) {
        get(this.redis, [], obj);
    } else if (util.nil(obj)) {
        get(this.redis, [], callback);
    } else if (util.isArray(obj) && obj.length === 0) {
        callback([]);
    } else if (util.isArray(obj)) {
        get(this.redis, obj, callback);
    } else {
        get(this.redis, [obj], function(res) {
            callback(res[0]);
        });
    }
};

Feed.prototype.update = function(feed, callback) {
    this.add(feed, callback);
};

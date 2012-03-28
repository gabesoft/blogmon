var ALL_LIST = 'feeds',
    ALL_SET = 'feed:all',
    UNSUBSCRIBED_SET = 'feed:unsubscribed',
    util = require('../util.js'),
    trav = require('traverse'),
    url = require('url');

function Feed (redis) {
    if (!(this instanceof Feed)) { return new Feed(redis); }
    this.redis = redis;
}

module.exports = Feed;

var getKey = function(uri) {
    return url.parse(uri).host;
};

var subsKey = function(key) {
    return 'feed:subscribers:' + key;
};

var dataKey = function(key) {
    return 'feed:data:' + key;
};

Feed.prototype.subscribe = function(feed, callback) {
    var key, 
        counts = [], 
        me = this,
        redis = this.redis,
        multi,
        isEmptyArray = util.isArray(feed) && util.isEmpty(feed);

    if (util.nil(feed) || isEmptyArray) {
        callback(null);
    }
    else if (util.isString(feed)) {
        key = getKey(feed);
        redis.incr(subsKey(key), function(err, count) {
            callback(count);
        });
    }
    else if (util.isArray(feed)) {
        me.subscribe(feed[0], function(count) {
            counts.push(count);
            me.subscribe(feed.slice(1), function(rest) {
                if (rest !== null) {
                    counts.push.apply(counts, rest);
                }
                callback(counts);
            });
        });
    }
    else {
        key = getKey(feed.uri);
        this.add(feed, function(res) {
            redis.incr(subsKey(key), function(err, subscribers) {
                callback(subscribers);
            });
        });
    }
};

Feed.prototype.add = function(feed, callback) {
    var key = getKey(feed.uri),
        redis = this.redis,
        multi = redis.multi();
    redis.sismember(ALL_SET, key, function(err, mem) {
        multi = redis.multi();

        if (mem === 0) {
            multi.lpush(ALL_LIST, JSON.stringify(feed));
            multi.sadd(ALL_SET, key);
            multi.del(subsKey(key));
        }

        multi.srem(UNSUBSCRIBED_SET, key);
        multi.exec(function(err, res) {
            redis.get(subsKey(key), function(err, subscribers) {
                callback(parseInt(subscribers || '0', 10));
            });
        });
    });
};

Feed.prototype.update = function(feed, callback) {
    var key = getKey(feed.uri), 
        redis = this.redis;

    redis.lrange(ALL_LIST, 0, -1, function(err, all) {
        var feeds = all.map(JSON.parse);
        trav(feeds).forEach(function(node) {
            if (this.parents.length === 1 && getKey(node.uri) === key) {
                this.update(feed);
            }
        });
        redis.del(ALL_LIST, function(err, res) {
            redis.rpush(ALL_LIST, feeds.map(JSON.stringify), function(err, count) {
                redis.get(subsKey(key), function(err, subscribers) {
                    callback(parseInt(subscribers, 10));
                });
            });
        });
    });
};

Feed.prototype.unsubscribe = function(uri, callback) {
    var key = getKey(uri), 
        redis = this.redis;

    redis.sismember(UNSUBSCRIBED_SET, key, function(err, mem) {
        if (mem === 1) {
            callback(0);
        } else {
            redis.decr(subsKey(key), function(err, count) {
                if (count === 0) {
                    redis.sadd(UNSUBSCRIBED_SET, key, function(err, len) {
                        callback(count);
                    });
                } else {
                    callback(count);
                }
            });
        }
    });
};

Feed.prototype.setData = function(uri, data, callback) {
    var key = getKey(uri), 
        redis = this.redis;

    redis.set(dataKey(key), JSON.stringify(data), callback);
};

Feed.prototype.getData = function(uri, callback) {
    var key = getKey(uri), 
        redis = this.redis;

    redis.get(dataKey(key), function(err, data) {
        callback(JSON.parse(data));
    });
};

Feed.prototype.getAll = function(callback) {
    var redis = this.redis, 
        multi = redis.multi();

    multi.smembers(UNSUBSCRIBED_SET);
    multi.lrange(ALL_LIST, 0, -1);
    multi.exec(function(err, res) {
        var unsubscribed = util.toHash(res[0]),
            feeds        = res[1].map(JSON.parse),
            subscribed;

        subscribed = feeds.filter(function(feed) {
            var key = getKey(feed.uri);
            return !unsubscribed[key];
        });

        callback(subscribed);
    });
};

Feed.prototype.length = function(callback) {
    this.redis.llen(ALL_LIST, function(err, count) {
      callback(count);
    });
};

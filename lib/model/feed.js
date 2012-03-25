var ALL_LIST = 'feeds',
    ALL_SET = 'feed:all',
    UNSUBSCRIBED_SET = 'feed:unsubscribed',
    util = require('underscore'),
    trav = require('traverse'),
    url = require('url');

function Feed (redis) {
    if (!(this instanceof Feed)) { return new Feed(redis); }
    this.redis = redis;
}

module.exports = Feed;

var getkey = function(uri) {
    return url.parse(uri).host;
};

var subskey = function(key) {
    return 'feed:subscribers:' + key;
};

var datakey = function(key) {
    return 'feed:data:' + key;
};

Feed.prototype.subscribe = function(feed, callback) {
    var key, 
        counts = [], 
        me = this,
        redis = this.redis,
        multi,
        isEmptyArray = util.isArray(feed) && util.isEmpty(feed);

    if (util.isNull(feed) || isEmptyArray) {
        callback(null, null);
    }
    else if (util.isString(feed)) {
        key = getkey(feed);
        redis.incr(subskey(key), function(err, count) {
            callback(err, count);
        });
    }
    else if (util.isArray(feed)) {
        me.subscribe(feed[0], function(err, count) {
            counts.push(count);
            me.subscribe(feed.slice(1), function(err, rest) {
                if (rest !== null) {
                    counts.push.apply(counts, rest);
                }
                callback(err, counts);
            });
        });
    }
    else {
        key = getkey(feed.uri);
        this.add(feed, function(err, res) {
            redis.incr(subskey(key), function(err, subscribers) {
                callback(err, subscribers);
            });
        });
    }
};

Feed.prototype.add = function(feed, callback) {
    var key = getkey(feed.uri),
        redis = this.redis,
        multi = redis.multi();
    redis.sismember(ALL_SET, key, function(err, mem) {
        multi = redis.multi();

        if (mem === 0) {
            multi.lpush(ALL_LIST, JSON.stringify(feed));
            multi.sadd(ALL_SET, key);
            multi.del(subskey(key));
        }

        multi.srem(UNSUBSCRIBED_SET, key);
        multi.exec(function(err, res) {
            redis.get(subskey(key), function(err, subscribers) {
                callback(err, parseInt(subscribers || '0', 10));
            });
        });
    });
};

Feed.prototype.update = function(feed, callback) {
    var key = getkey(feed.uri), 
        redis = this.redis;

    redis.lrange(ALL_LIST, 0, -1, function(err, all) {
        var feeds = all.map(JSON.parse);
        trav(feeds).forEach(function(node) {
            if (this.parents.length === 1 && getkey(node.uri) === key) {
                this.update(feed);
            }
        });
        redis.del(ALL_LIST, function(err, res) {
            redis.rpush(ALL_LIST, feeds.map(JSON.stringify), function(err, count) {
                redis.get(subskey(key), function(err, subscribers) {
                    callback(err, parseInt(subscribers, 10));
                });
            });
        });
    });
};

Feed.prototype.unsubscribe = function(uri, callback) {
    var key = getkey(uri), 
        redis = this.redis;

    redis.sismember(UNSUBSCRIBED_SET, key, function(err, mem) {
        if (mem === 1) {
            callback(err, 0);
        } else {
            redis.decr(subskey(key), function(err, count) {
                if (count === 0) {
                    redis.sadd(UNSUBSCRIBED_SET, key, function(err, len) {
                        callback(err, count);
                    });
                } else {
                    callback(err, count);
                }
            });
        }
    });
};

Feed.prototype.setData = function(uri, data, callback) {
    var key = getkey(uri), 
        redis = this.redis;

    redis.set(datakey(key), JSON.stringify(data), callback);
};

Feed.prototype.getData = function(uri, callback) {
    var key = getkey(uri), 
        redis = this.redis;

    redis.get(datakey(key), function(err, data) {
        callback(err, JSON.parse(data));
    });
};

Feed.prototype.getall = function(callback) {
    var redis = this.redis, 
        multi = redis.multi();

    multi.smembers(UNSUBSCRIBED_SET);
    multi.lrange(ALL_LIST, 0, -1);
    multi.exec(function(err, res) {
        var unsubscribed = {},
            feeds = res[1].map(JSON.parse),
            subscribed;

        res[0].forEach(function(k) {
            unsubscribed[k] = true;
        });
        subscribed = feeds.filter(function(feed) {
            var key = getkey(feed.uri);
            return !unsubscribed[key];
        });

        callback(err, subscribed);
    });
};

Feed.prototype.length = function(callback) {
    this.redis.llen(ALL_LIST, callback);
};

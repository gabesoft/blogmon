/*
 * Feed aggregator.
 */

var util        = require('./util.js'),
    request     = require('request'),
    events      = require('events'),
    Task        = require('./task.js'),
    Feed        = require('./model/feed.js'),
    Post        = require('./model/post.js'),
    FeedParser  = require('feedparser');

function Aggregator (redis, interval) {
    if (!(this instanceof Aggregator)) { return new Aggregator(interval, feed, post); }
    this.feed     = new Feed(redis);
    this.post     = new Post(redis);
    this.task     = null;
    this.interval = interval || 3600; // default 1 hour
}

module.exports = Aggregator;

var buildPost = function(feedUri, post) {
    return {
        feedUri: feedUri,
        title: post.title || (post.description || '').substring(0, 100),
        description: (post.description || '').substring(0, 300),
        link: post.link,
        date: post.date,
        pubdate: post.pubdate,
        author: post.author,
        guid: post.guid,
        image: post.image
    };
};

var buildFeed = function(uri, meta, data) {
    return {
        uri: uri,
        title: meta.title,
        description: meta.description,
        link: meta.link,
        author: meta.author,
        language: meta.language,
        image: meta.image,
        date: meta.date,
        data: data
    };
};

var runFeed = function(agg, obj, callback) {
    var uri  = util.isString(obj) ? obj : obj.uri,
        data = util.isString(obj) ? {} : obj.data;

    var req  = {
        uri: uri,
        headers: {
            "If-Modified-Since": data.lastModified || '',
            "If-None-Match": data.etag || ''
        }
    };

    request(req, function(reqError, res, body) {
        var parser = new FeedParser();
        if (body) {
            parser.parseString(body, function(parseError, meta, rawPosts) {
                var data = {
                    lastModified: res.headers['last-modified'],
                    etag: res.headers.etag
                };
                var posts = rawPosts.map(util.curry(buildPost, req.uri)),
                    feed  = buildFeed(req.uri, meta, data);

                agg.feed.add(feed, function(subscribers) {
                    agg.post.add(posts, function(addCount) {
                        callback(feed, addCount);
                    });
                });
            });
        } else {
            callback(null, 0);
        }
    });
};

var runOne = function(agg, obj, callback) {
    runFeed(agg, obj, function(feed, count) {
        if (count === 0) {
            agg.emit('feed-unchanged', feed.uri);
        } else {
            agg.emit('feed-updated', feed.uri, count);
        }
        if (util.isFunction(callback)) {
            callback(feed, count);
        }
    });
};

Aggregator.prototype = new events.EventEmitter();

Aggregator.prototype.run = function() {
    var run = function(agg) {
        agg.feed.getall(function(feeds) {
            feeds.forEach(function(feed) { 
                runOne(agg, feed.uri);
            });
        });
    };

    this.task = new Task(run, null, this);
    this.task.repeat(this.interval);
};

Aggregator.prototype.stop = function() {
    if (this.task) {
        this.task.cancel();
    }
};

Aggregator.prototype.runNow = function(feedUri, callback) {
    runOne(this, feedUri, callback);
};

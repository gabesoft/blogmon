/*
 * Feed aggregator.
 */

var util       = require('./util.js')
  , eyes       = require('eyes')
  , request    = require('request')
  , events     = require('events')
  , Sanitizer  = require('./processor/post_sanitizer.js')
  , Settings   = require('./app/user_settings_helper.js')
  , Task       = require('./task.js')
  , Feed       = require('./model/feed.js')
  , Post       = require('./model/post.js')
  , User       = require('./model/user.js')
  , FeedParser = require('feedparser')
  , Builder    = require('./builder.js')
  , builder    = new Builder()
  , PGFeed     = require('./processor/pgfeed.js')
  , pgfeed     = new PGFeed()
  , sanitizer  = new Sanitizer()

  , persist    = function(agg, feed, posts, rawPosts, callback) {
        agg.feed.add(feed, function(subscribers) {
            agg.post.add(posts, function(guids) {
                callback(feed, guids);

                var added   = util.toMap(guids)
                  , setDesc = function(guid, desc) {
                        sanitizer.clean(desc, function(clean) {
                            agg.post.setDescription(guid, clean);
                        });
                    };

                rawPosts.forEach(function(raw) {
                    if (added[raw.guid]) {
                        if (pgfeed.appliesTo(feed.uri)) {
                            pgfeed.getDescription(raw, raw.description, function(desc) {
                                setDesc(raw.guid, desc);
                            });
                        } else {
                            setDesc(raw.guid, raw.description);
                        }
                    }
                });
            });
        });
    }

  , runFeed = function(agg, obj, callback) {
        var uri  = util.isString(obj) ? obj : obj.uri
          , data = util.isString(obj) ? {}  : (obj.data || {})
          , req  = {
                uri: uri
              , headers: {
                    "If-Modified-Since": data.lastModified || '',
                    "If-None-Match"    : data.etag || ''
                }
            };

        request(req, function(reqError, res, body) {
            var parser  = new FeedParser()
              , invalid = { id: null, uri: req.uri };

            parser.on('error', function() {
                console.error('error', arguments);
            });

            if (body) {
                parser.parseString(body, function(parseError, meta, rawPosts) {
                    if (util.exists(parseError) || util.nil(meta)) {
                        console.log(parseError, body);
                        callback(invalid, []);
                    } else {
                        var data = {
                                lastModified: res.headers['last-modified']
                              , etag        : res.headers.etag
                            }
                          , feed  = builder.feed(req.uri, meta, data)
                          , posts = rawPosts.map(function(post) {
                                return builder.post(post, feed);
                            });

                        if (pgfeed.appliesTo(feed.uri)) {
                            posts.forEach(util.bind(pgfeed.process, pgfeed));
                        }

                        persist(agg, feed, posts, rawPosts, callback);
                    } 
                });
            } else {
                callback(invalid, []);
            }
        });
    }

  , runOne = function(agg, obj, callback) {
        runFeed(agg, obj, function(feed, guids) {
            var count = guids.length;
            if (count === 0) {
                agg.emit('feed-unchanged', feed.uri);
            } else {
                agg.emit('feed-updated', feed.uri, count);
            }

            util.call(callback, feed, guids);
        });
    }

  , setUnread = function(users, redis, feed, guids) {
        if (guids.length === 0) { return; }

        users.names(function(names) {
            var i   = 0
              , len = names.length
              , set = function(name) {
                    users.feeds(name, function(feeds) {
                        var subscribed = util.toMap(feeds)
                          , settings   = new Settings(redis, name);

                        if (subscribed[feed.uri]) {
                            settings.setUnread(feed.uri, guids, true);
                        }
                    });
                };

            for (i = 0; i < len; i += 1) {
                set(names[i]);
            }
        });
    };

function Aggregator (redis, interval) {
    if (!(this instanceof Aggregator)) { return new Aggregator(interval, feed, post); }
    this.redis    = redis;
    this.feed     = new Feed(redis);
    this.post     = new Post(redis);
    this.user     = new User(redis);
    this.task     = null;
    this.interval = interval || 3600; // default 1 hour
    //this.interval = 30;
}

module.exports = Aggregator;

Aggregator.prototype = new events.EventEmitter();

Aggregator.prototype.run = function() {
    var users = this.user
      , redis = this.redis
      , run   = function(agg) {
            agg.feed.get(function(feeds) {
                feeds.forEach(function(feed) { 
                    runOne(agg, feed, function(updated, guids) {
                        setUnread(users, redis, feed, guids);
                    });
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

Aggregator.prototype.runNow = function(feed, callback) {
    runOne(this, feed, callback);
};

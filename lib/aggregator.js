/*
 * Feed aggregator.
 */

var util       = require('./util.js')
  , eyes       = require('eyes')
  , request    = require('request')
  , events     = require('events')
  , Sanitizer  = require('./processor/post_sanitizer.js')
  , Task       = require('./task.js')
  , Feed       = require('./model/feed.js')
  , Post       = require('./model/post.js')
  , FeedParser = require('feedparser')
  , sanitizer  = new Sanitizer()

  , buildPost  = function(feed, post) {
        return {
            feedUri     : feed.uri
          , feedTitle   : feed.title
          , feedLink    : feed.link
          , title       : post.title || 'Untitled'
          , description : null
          , link        : post.link
          , date        : post.date || new Date()
          , pubdate     : post.pubdate
          , author      : post.author
          , guid        : post.guid
          , image       : post.image
        };
    }

  , buildFeed = function(uri, meta, data, searchId) {
        return {
            searchId    : searchId || null
          , uri         : uri
          , title       : meta.title
          , description : meta.description
          , link        : meta.link || uri
          , author      : meta.author
          , language    : meta.language
          , image       : meta.image
          , date        : meta.date
          , data        : data
        };
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
                        callback(invalid, 0);
                    } else {
                        var data = {
                                lastModified: res.headers['last-modified']
                              , etag        : res.headers.etag
                            }
                          , feed  = buildFeed(req.uri, meta, data, obj.searchId)
                          , posts = rawPosts.map(util.curry(buildPost, feed))
                          , descs = rawPosts.map(function(raw) {
                                return { 
                                    guid        : raw.guid
                                  , description : raw.description
                                };
                            });

                        util.cont(descs, null, function(desc, cont) {
                            sanitizer.clean(desc.description, function(clean) {
                                agg.post.setDescription(desc.guid, clean, cont);
                            }, feed.title);
                        });

                        agg.feed.add(feed, function(subscribers) {
                            agg.post.add(posts, function(addCount) {
                                // TODO: description should be processed here 
                                //       only for the added posts
                                callback(feed, addCount);
                            });
                        });
                    } 
                });
            } else {
                callback(invalid, 0);
            }
        });
    }

  , runOne = function(agg, obj, callback) {
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

function Aggregator (redis, interval) {
    if (!(this instanceof Aggregator)) { return new Aggregator(interval, feed, post); }
    this.feed     = new Feed(redis);
    this.post     = new Post(redis);
    this.task     = null;
    this.interval = interval || 3600; // default 1 hour
}

module.exports = Aggregator;

Aggregator.prototype = new events.EventEmitter();

Aggregator.prototype.run = function() {
    var run = function(agg) {
            agg.feed.get(function(feeds) {
                feeds.forEach(function(feed) { 
                    runOne(agg, feed);
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

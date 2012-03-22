/*
 * Feed aggregator.
 */

var util        = require('./util.js'),
    request     = require('request'),
    events      = require('events'),
    Task        = require('./task.js'),
    FeedParser  = require('feedparser');

function Aggregator (feed, post, interval) {
  if (!(this instanceof Aggregator)) { return new Aggregator(interval, feed, post); }
  this.feed     = feed;
  this.post     = post;
  this.task     = null;
  this.interval = interval || 3600; // default 1 hour
  this.running  = {};
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

var buildFeed = function(uri, meta) {
  return {
    uri: uri,
    title: meta.title,
    description: meta.description,
    link: meta.link,
    author: meta.author,
    language: meta.language,
    image: meta.image,
    date: meta.date
  };
};

var runFeed = function(agg, feedUri, data, callback) {
  data = data || {};
  var req = {
    uri: feedUri,
    "If-Modified-Since": data.lastModified,
    "If-None-Match": data.etag
  };

  request(req, function(reqError, res, body) {
      var parser = new FeedParser();
      if (body) {
        parser.parseString(body, function(parseError, meta, rawPosts) {
            var data = {
              lastModified: res.headers['last-modified'],
              etag: res.headers.etag
            };
            var posts = rawPosts.map(function(post) {
                return buildPost(req.uri, post);
            });
            var feed = buildFeed(req.uri, meta);

            agg.feed.add(feed, function(feedAddError) {
                agg.post.add(posts, function(postsAddError, count) {
                    agg.feed.setData(req.uri, data, function(err) {
                        var errors = [reqError, parseError, feedAddError, postsAddError];
                        callback(errors, count);
                    });
                });
            });
        });
      } else {
        callback([], 0);
      }
  });
};

var runOne = function(agg, feedUri, callback) {
  if (agg.running[feedUri]) { return; }
  agg.feed.getData(feedUri, function(err, data) {
      agg.running[feedUri] = true;
      runFeed(agg, feedUri, data, function(errors, savedCount) {
          agg.running[feedUri] = false;
          if (savedCount === 0) {
            agg.emit('feed-unchanged', errors, feedUri);
          } else {
            agg.emit('feed-updated', errors, feedUri, savedCount);
          }
          callback(errors, feedUri, savedCount);
      });
  });
};

var run = function(agg) {
  agg.feed.getall(function(err, feeds) {
      agg.forEach(function(feed) { 
          runOne(agg, feed);
      });
  });
};

Aggregator.prototype = new events.EventEmitter();

Aggregator.prototype.run = function() {
  this.task = new Task(run, null, this);
  task.repeat(this.interval);
};

Aggregator.prototype.stop = function() {
  if (this.task) {
    this.task.cancel();
  }
};

Aggregator.prototype.runNow = function(feedUri, callback) {
  runOne(this, feedUri, callback);
};

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

var buildPost = function(feedUri, rawPost) {
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

var runFeed = function(agg, feed, data, callback) {
  data = data || {};
  var req = {
    uri: feed.uri,
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

            agg.post.add(posts, function(saveError, count) {
                agg.feed.setData(data, function(err) {
                    var errors = [reqError, parseError, saveError];
                    callback(errors, req.uri, count);
                });
            });
        });
      }
  });
};

var runOne = function(agg, feed) {
  if (agg.running[feed.uri]) { return; }
  agg.feed.getData(function(err, data) {
      agg.running[feed.uri] = true;
      runOne(agg, feed, data, function(errors, feedUri, savedCount) {
          agg.running[feed.uri] = false;
          agg.emit('feed-updated', errors, feedUri, savedCount);
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

// TODO: this should save the feed info as well and should use the callback
Aggregator.prototype.runNow = function(feeds, callback) {
  feeds = util.isArray(feeds) ? feeds : [feeds];
  var shouldRun = {};
  feeds.forEach(function(feed) {
    shouldRun[feed] = true;
  });
  this.feed.getall(function(err, feeds) {
    feeds.forEach(function(feed) {
      if (shouldRun[feed]) {
        runOne(this, feed);
      }
    });
  });
};

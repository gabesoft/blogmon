var GUID_SET = 'post:guids', 
    FEED_SET = 'post:feeds',
    util = require('../util.js'),
    trav = require('traverse'),
    url = require('url');

function Post (redis) {
  if (!(this instanceof Post)) { return new Post(redis); }
  this.redis = redis;
}

module.exports = Post;

var getkey = function(feedUri) {
  return 'posts:' + feedUri;
};

var prepare = function(lists, start, limit) {
  var posts     = [],
      bestindex = -1,
      bestdate  = null,
      post      = null,
      hasdata   = true,
      indexes   = null,
      getdate   = function(post) { return post.date || post.pubdate; },
      removeAt  = function(index) { lists.splice(index, 1); };

  var findBest = function(list, index) {
    var date = null, 
        first = list[0];

    if (list.length > 0) {
      date = getdate(first);
      if (bestdate === null || date > bestdate) {
        bestdate = date;
        bestindex = index;
      }
    } else {
      indexes.push(index);
    }
  };

  while (hasdata) {
    bestdate  = null;
    bestindex = -1;
    hasdata   = false;
    indexes   = [];

    if (lists.length === 1) {
      posts = posts.concat(lists[0]);
      break;
    }

    lists.forEach(findBest);

    if (bestindex > -1) {
      hasdata = true;
      post = lists[bestindex].shift();
      posts.push(post);
    }

    indexes.forEach(removeAt);
  }

  if (posts.length > start) {
    posts = posts.slice(start, posts.length);
  }
  if (limit > -1 && posts.length > limit) {
    posts = posts.slice(0, limit);
  }

  return posts;
};

Post.prototype.add = function(posts, callback) {
  var redis = this.redis, 
      multi = redis.multi();

  posts = util.isArray(posts) ? posts : [posts];

  redis.smembers(GUID_SET, function(err, saved) {
      var exists = {},
          feeds  = {}, 
          guids  = {},
          ready  = {};

      saved.forEach(function(guid) { exists[guid] = true; });

      posts = posts.forEach(function(post) {
          post.guid = util.check.nil(post.guid) ? post.link : post.guid;
          if (!exists[post.guid]) { 
            feeds[post.feedUri] = true;
            guids[post.guid] = true;
            if (util.check.nil(ready[post.feedUri])) {
              ready[post.feedUri] = [];
            }
            ready[post.feedUri].push(JSON.stringify(post));
          }
      });

      multi.sadd(FEED_SET, Object.keys(feeds));
      multi.sadd(GUID_SET, Object.keys(guids));
      Object.keys(ready).forEach(function(uri) {
          multi.rpush(getkey(uri), ready[uri]);
      });

      multi.exec(function(err, res) {
          callback(err, res.slice(2, res.length));
      });
  });
};

Post.prototype.get = function(feedUris, start, limit, callback) {
  var redis = this.redis,
      multi = redis.multi(),
      add   = {},
      all   = false;

  feedUris = util.isString(feedUris) ? [feedUris] : feedUris;
  feedUris = feedUris || [];
  start    = start || 0;
  limit    = limit || -1;
  all      = util.isEmptyArray(feedUris);

  feedUris.forEach(function(feed) { add[feed] = true; });

  redis.smembers(FEED_SET, function(err, allFeeds) {
      var feeds = {},
          posts = [];

      allFeeds.forEach(function(feed) {
          if (all || add[feed]) {
            feeds[feed] = true;
          }
      });

      Object.keys(feeds).forEach(function(feed) {
          multi.lrange(getkey(feed), 0, limit);
      });

      multi.exec(function(err, lists) {
          lists = lists.map(function(list) { return list.map(JSON.parse); });
          posts = prepare(lists, start, limit);
          callback(err, posts);
      });
  });
};

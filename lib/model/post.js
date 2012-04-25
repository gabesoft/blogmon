var GUID_SET = 'post:guids' 
  , FEED_SET = 'post:feeds'
  , util     = require('../util.js')
  , trav     = require('traverse')
  , eyes     = require('eyes')
  , url      = require('url')
  , isDate   = util.toHash([ 'pubdate', 'date', 'pubDate' ])

  , getKey = function(feedUri) {
        return 'posts:' + feedUri;
    }

  , parse = function(str) {
        return JSON.parse(str, function(k, v) {
            return isDate[k] ? new Date(v) : v;
        });
    }

  , toStr = function(token) {
        return JSON.stringify(token);
    }

  , prepare = function(lists, start, limit) {
        var posts     = []
          , bestindex = -1
          , bestdate  = null
          , post      = null
          , hasdata   = true
          , indexes   = null
          , getdate   = function(post) { return post.date || post.pubdate; }
          , removeAt  = function(index) { lists.splice(index, 1); }

          , findBest = function(list, index) {
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

function Post (redis) {
    if (!(this instanceof Post)) { return new Post(redis); }
    this.redis = redis;
}

module.exports = Post;

Post.prototype.add = function(posts, callback) {
    var redis = this.redis 
      , multi = redis.multi();

    posts = util.isArray(posts) ? posts : [posts];

    redis.smembers(GUID_SET, function(err, saved) {
        var exists   = {}
          , feeds    = {} 
          , guids    = {}
          , ready    = {}
          , newPosts = false;

        saved.forEach(function(guid) { exists[guid] = true; });

        posts = posts.forEach(function(post) {
            post.guid = util.nil(post.guid) ? post.link : post.guid;
            if (!exists[post.guid]) { 
                newPosts            = true;
                feeds[post.feedUri] = true;
                guids[post.guid]    = true;
                ready[post.feedUri] = ready[post.feedUri] || [];
                ready[post.feedUri].unshift(post);
            }
        });

        if (newPosts) {
            multi.sadd(FEED_SET, Object.keys(feeds));
            multi.sadd(GUID_SET, Object.keys(guids));
            Object.keys(ready).forEach(function(uri) {
                multi.lpush(getKey(uri), ready[uri].map(toStr));
            });

            multi.exec(function(err, res) {
                var count = 0;
                res
                   .slice(2, res.length)
                   .forEach(function(c) { count += c; });
                callback(count);
            });
        } else {
            callback(0);
        }
    });
};

Post.prototype.get = function(feedUris, start, limit, callback) {
    var redis = this.redis
      , multi = redis.multi()
      , add   = {}
      , all   = false;

    feedUris = util.isString(feedUris) ? [feedUris] : feedUris;
    feedUris = feedUris || [];
    start    = start || 0;
    limit    = limit || -1;
    all      = util.isEmpty(feedUris);

    feedUris.forEach(function(feed) { add[feed] = true; });

    redis.smembers(FEED_SET, function(err, allFeeds) {
        var feeds = {}
          , posts = [];

        allFeeds.forEach(function(feed) {
            if (all || add[feed]) {
                feeds[feed] = true;
            }
        });

        Object.keys(feeds).forEach(function(feed) {
            multi.lrange(getKey(feed), 0, limit);
        });

        multi.exec(function(err, lists) {
            lists = lists.map(function(list) { return list.map(parse); });
            posts = prepare(lists, start, limit);
            callback(posts);
        });
    });
};

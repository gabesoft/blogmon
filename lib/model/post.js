var GUID_SET = 'post:guids' 
  , FEED_SET = 'post:feeds'
  , util     = require('../util.js')
  , trav     = require('traverse')
  , eyes     = require('eyes')
  , url      = require('url')
  , isDate   = util.toHash([ 'pubdate', 'date', 'pubDate' ])

  , feedKey = function(feedUri) {
        return 'posts_by_feed:' + feedUri;
    }

  , postKey = function(post) {
        return 'posts:' + post.guid;
    }

  , postScore = function(post) {
        var raw = post.date || post.pubdate
          , date = util.isDate(raw) ? raw : new Date();
        return date.getTime();
    }

  , parse = function(str) {
        return JSON.parse(str, function(k, v) {
            return isDate[k] ? new Date(v) : v;
        });
    }

  , toStr = function(token) {
        return JSON.stringify(token);
    }

  , addPosts = function(uri, posts, redis, callback) {
        var key = feedKey(uri)
          , multi = redis.multi();

        redis.zrange(key, 0, -1, function(err, guids) {
            var exists = util.toHash(guids)
              , count  = 0;

            multi.sadd(FEED_SET, uri);
            posts.forEach(function(post) {
                post.guid = util.nil(post.guid) ? post.link : post.guid;
                if (!exists[post.guid]) {
                    multi.zadd(key, postScore(post), post.guid);
                    multi.set(postKey(post), toStr(post));
                    count += 1;
                }
            });

            multi.exec(function(err, res) {
                callback(count);
            });
        });
    }

  , prepare = function(lists, start, limit) {
        var posts     = []
          , bestindex = -1
          , bestdate  = null
          , post      = null
          , hasdata   = true
          , indexes   = null
          , removeAt  = function(index) { lists.splice(index, 1); }
          , findBest  = function(list, index) {
                var date  = null 
                  , first = list[0];

                if (list.length > 0) {
                    date = first.date;
                    if (bestdate === null || date > bestdate) {
                        bestdate  = date;
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
                post    = lists[bestindex].shift();
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
    posts = util.isArray(posts) ? posts : [posts];
    var redis = this.redis
      , byUri = util.groupBy(posts, 'feedUri')
      , count = 0
      , endfn = function() {
            callback(count);
        }
      , addfn = function(uri, cont) {
            addPosts(uri, byUri[uri], redis, function(c) {
                count += c;
                cont();
            });
        };

    util.cont(Object.keys(byUri), endfn, addfn);
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
    add      = util.toHash(feedUris);

    redis.smembers(FEED_SET, function(err, allFeeds) {
        var feeds = {}
          , posts = [];

        allFeeds.forEach(function(feed) {
            if (all || add[feed]) {
                feeds[feed] = true;
            }
        });

        Object
           .keys(feeds)
           .forEach(function(uri) {
                multi.zrevrange(feedKey(uri), 0, limit, 'WITHSCORES');
            });

        multi.exec(function(err, lists) {
            var guids = null
              , posts = null;

            guids = lists.map(function(list) {
                var res = []
                  , i   = 0;

                for (i = 0; i < list.length; i += 2) {
                    res.push({ 
                        guid: list[i]
                      , date: parseInt(list[i + 1], 10) 
                    });
                }

                return res;
            });


            posts = prepare(guids, start, limit);
            multi = redis.multi();

            posts.forEach(function(post) {
                multi.get(postKey(post));
            });

            multi.exec(function(err, res) {
                callback(res.map(parse));
            });
        });
    });
};

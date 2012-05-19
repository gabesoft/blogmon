var GUID_SET = 'post:guids' 
  , FEED_SET = 'post:feeds'
  , util     = require('../util.js')
  , trav     = require('traverse')
  , eyes     = require('eyes')
  , url      = require('url')
  , isDate   = util.toMap([ 'pubdate', 'date', 'pubDate' ])

  , feedKey = function(feedUri) {
        return util.str.sprintf('posts_by_feed:%s', feedUri);
    }

  , descKey = function(guid) {
        return util.str.sprintf('post:%s:desc', guid);
    }

  , postKey = function(post) {
        return util.str.sprintf('posts:%s', post.guid);
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
            var exists = util.toMap(guids)
              , added  = [];

            multi.sadd(FEED_SET, uri);
            posts.forEach(function(post) {
                post.guid = util.nil(post.guid) ? post.link : post.guid;
                if (!exists[post.guid]) {
                    multi.zadd(key, postScore(post), post.guid);
                    multi.set(postKey(post), toStr(post));
                    added.push(post.guid);
                }
            });

            multi.exec(function(err, res) {
                util.call(callback, added);
            });
        });
    }

  , merge = function(lists) {
        var posts     = []
          , bestindex = 0
          , bestdate  = null
          , empty     = null
          , remove    = function(index) { lists.splice(index, 1); }
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
                    empty.push(index);
                }
            };

        while (bestindex !== -1) {
            bestdate  = null;
            bestindex = -1;
            empty   = [];

            if (lists.length === 1) {
                posts = posts.concat(lists[0]);
                break;
            }

            lists.forEach(findBest);

            if (bestindex > -1) {
                posts.push(lists[bestindex].shift());
            }

            empty.forEach(remove);
        }

        return posts;
    }

  , prepare = function(lists, start, limit) {
        var posts = merge(lists);

        if (posts.length > start) {
            posts = posts.slice(start, posts.length);
        } else {
            posts = [];
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
      , added = []
      , endfn = function() {
            callback(added);
        }
      , addfn = function(uri, cont) {
            addPosts(uri, byUri[uri], redis, function(a) {
                added = added.concat(a);
                cont();
            });
        };

    util.cont(Object.keys(byUri), endfn, addfn);
};

Post.prototype.get = function(feedUris, start, limit, callback) {
    if (util.isArray(feedUris) && feedUris.length === 0) {
        util.call(callback, []);
        return;
    }

    var redis = this.redis
      , multi = redis.multi()
      , add   = {}
      , all   = false;

    feedUris = util.isString(feedUris) ? [feedUris] : feedUris;
    feedUris = feedUris || [];
    start    = start || 0;
    limit    = limit || -1;
    all      = util.isEmpty(feedUris);
    add      = util.toMap(feedUris);

    redis.smembers(FEED_SET, function(err, allFeeds) {
        var feeds = util.toMap(allFeeds, null, null, function(feed) {
                return (all || add[feed]);
            })
          , posts = [];

        Object
           .keys(feeds)
           .forEach(function(uri) {
                multi.zrevrange(feedKey(uri), 0, start + limit, 'WITHSCORES');
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
                util.call(callback, res.map(parse));
            });
        });
    });
};

Post.prototype.setDescription = function(guid, description, callback) {
    var redis = this.redis
      , key   = descKey(guid);
    redis.set(key, description, function(err, res) {
        util.call(callback, res);
    });
};

Post.prototype.getDescription = function(guid, callback) {
    var redis = this.redis
      , key   = descKey(guid);
    redis.get(key, function(err, res) {
        util.call(callback, res);
    });
};

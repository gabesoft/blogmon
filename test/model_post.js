var should = require('should')
  , util   = require('../lib/util.js')
  , Post   = require('../lib/model/post.js')
  , eyes   = require('eyes')
  , redis  = require('./redis_helper.js').client()
  , trav   = require('traverse')
  , posts  = require('./support/data_post.js').posts
  , large  = require('./support/data_post_large.js').posts
  , repo   = new Post(redis);

describe('post', function() {
    beforeEach(function() {
        redis.flushdb();
    });

    it('should add one post', function(done) {
        repo.add(posts[0], function() {
            repo.get([], 0, -1, function(res) {
                res.length.should.equal(1);
                res[0].guid.should.equal(posts[0].guid);
                done();
            });
        });
    });

    it('should get posts for one feed', function(done) {
        var uri      = 'http://blog.izs.me/rss'
          , filtered = util.filter(posts, function(post) {
                return post.feedUri === uri;
            })
          , len = filtered.length
          , max = util.max(filtered, function(post) {
                return post.date;
            })
          , min = util.min(filtered, function(post) {
                return post.date;
            });

        repo.add(posts, function(added) {
            repo.get(uri, 0, -1, function(res) {
                res.length.should.equal(len);
                res[0].guid.should.equal(max.guid);
                res[len - 1].guid.should.equal(min.guid);
                done();
            });
        });
    });

    it('should add multiple posts', function(done) {
        repo.add(posts.slice(0, 2), function(count) {
            repo.get([], 0, -1, function(res) {
                res.length.should.equal(2);
                res[0].guid.should.equal(posts[0].guid);
                res[1].guid.should.equal(posts[1].guid);
                done();
            });
        });
    });

    it('should return the proper count when adding posts', function(done) {
        repo.add(posts.slice(0, 3), function(count) {
            count.should.equal(3);
            repo.add(posts.slice(0, 4), function(count2) {
                count2.should.equal(1);
                repo.add(posts.slice(0, 2), function(count3) {
                    count3.should.equal(0);
                    done();
                });
            });
        });
    });

    it('should get all posts', function(done) {
        repo.add(posts, function() {
            repo.get([], 0, -1, function(res) {
                res.length.should.equal(posts.length);
                done();
            });
        });
    });

    it('should get posts selectively', function(done) {
        var urls = [
                'http://www.mikealrogers.com/site.rss',     // 3
                'http://decafbad.com/blog/rss.xml'          // 15
            ];
        repo.add(posts, function() {
            repo.get(urls, 0, -1, function(res) {
                var a = res.filter(function(x) { return x.feedUri === urls[0]; });
                var b = res.filter(function(x) { return x.feedUri === urls[1]; });
                a.length.should.equal(3);
                b.length.should.equal(15);
                res.length.should.equal(18);
                done();
            });
        });
    });

    it('should get posts sorted by date desc and paged', function(done) {
        var length   = 20
          , selected = posts.slice(0, length)
          , sorted   = trav(selected).clone()
          , l1, l2, l3;

        sorted.sort(function(x, y) {
            return x.date > y.date ? -1 : 1;
        });

        l1 = selected.slice(0, 5);
        l2 = selected.slice(4, 10);
        l3 = selected.slice(8, length);

        repo.add(l3, function() {
            repo.add(l2, function() {
                repo.add(l1, function() {
                    repo.get([], 0, 0, function(res) {
                        var i = 0;

                        for (i = 0; i < length; i += 1) {
                            res[i].guid.should.equal(sorted[i].guid);
                        }

                        res.length.should.equal(length);
                        done();
                    });
                });
            });
        });
    });

    it('should not add posts already added', function(done) {
        repo.add(posts.slice(0, 3), function() {
            repo.add(posts.slice(0, 5), function() {
                repo.get([], 0, -1, function(res) {
                    res.length.should.equal(5);
                    done();
                });
            });
        });
    });

    it('should add posts fast', function(done) {
        repo.add(large, function(count) {
            count.should.equal(large.length);
            done();
        });
    });

    it('should get posts fast', function(done) {
        repo.add(large, function(count) {
            var excluded = {
                    'http://www.mikealrogers.com/site.rss'    : true,
                    'http://www.curlybracecast.com/itunes.rss': true
                }
              , filtered = large.filter(function(post) {
                    return !excluded[post.feedUri];
                })
              , hash = util.toHash(filtered, function(post) {
                    return post.feedUri;
                })
              , urls = Object.keys(hash);

            repo.get(urls, 0, -1, function(res) {
                res.length.should.equal(filtered.length);
                done();
            });
        });
    });
});

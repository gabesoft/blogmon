var TEST_DB = 10,
    should = require('should'),
    Post = require('../lib/model/post.js'),
    eyes = require('eyes'),
    redis = require('redis').createClient(),
    trav = require('traverse'),
    posts = require('./support/data_post.js').posts,
    post = new Post(redis);

redis.select(TEST_DB);
redis.debug_mode = true;
redis.on('error', function(err) {
    console.log(err);
});

describe('post', function() {
    beforeEach(function() {
        redis.flushdb();
    });

    it('should add one post', function(done) {
        post.add(posts[0], function(err) {
            post.get([], 0, -1, function(err, res) {
                res.length.should.equal(1);
                res[0].guid.should.equal(posts[0].guid);
                done();
            });
        });
    });

    it('should get posts for one feed', function(done) {
        post.add(posts, function(err, added) {
            post.get('http://blog.izs.me/rss', 0, -1, function(err, res) {
                res.length.should.equal(20);
                res[0].guid.should.equal('http://blog.izs.me/post/19521376222');
                res[19].guid.should.equal('http://blog.izs.me/post/9552484379');
                done();
            });
        });
    });

    it('should add multiple posts', function(done) {
        post.add(posts.slice(0, 2), function(err) {
            post.get([], 0, -1, function(err, res) {
                res.length.should.equal(2);
                res[0].guid.should.equal(posts[0].guid);
                res[1].guid.should.equal(posts[1].guid);
                done();
            });
        });
    });

    it('should get all posts', function(done) {
        post.add(posts, function(err) {
            post.get([], 0, -1, function(err, res) {
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
        post.add(posts, function() {
            post.get(urls, 0, -1, function(err, res) {
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
        var sorted = trav(posts).clone();
        sorted.sort(function(x, y) {
            return x.date > y.date ? -1 : 1;
        });
        post.add(posts.slice(0,10), function() {
            post.add(posts.slice(10, posts.length), function() {
                post.get([], 10, 14, function(err, res) {
                    var i = 0;

                    for (i = 0; i < 14; i += 1) {
                      res[i].guid.should.equal(sorted[10 + i].guid);
                    }

                    res.length.should.equal(14);
                    done();
                });
            });
        });
    });

    it('should not add posts already added', function(done) {
        post.add(posts.slice(0, 3), function() {
            post.add(posts.slice(0, 5), function() {
                post.get([], 0, -1, function(err, res) {
                    res.length.should.equal(5);
                    done();
                });
            });
        });
    });
});

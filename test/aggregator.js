var should     = require('should')
  , eyes       = require('eyes')
  , Feed       = require('../lib/model/feed.js')
  , Post       = require('../lib/model/post.js')
  , Aggregator = require('../lib/aggregator.js')
  , redis      = require('./redis_helper.js').client()
  , feed       = new Feed(redis)
  , post       = new Post(redis)
  , agg        = new Aggregator(redis, 1);

agg.once('feed-updated', function(feed, count) {
    console.log('updated', feed, count);
});
agg.once('feed-unchanged', function(feed) {
    console.log('unchanged', feed);
});

describe('SLOW - aggregator', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    it('should save feed data', function(done) {
        var uri = 'http://robkuz-blog.blogspot.com/feeds/posts/default';
        agg.runNow(uri, function(record, saved) {
            record.uri.should.equal(uri);
            feed.get(function(feeds) {
                var found = feeds.filter(function(record) {
                        return record.uri === uri;
                    });
                found.length.should.equal(1);
                post.get(uri, 0, -1, function(posts) {
                    posts.length.should.equal(saved);
                    done();
                });
            });
        });
    });

    it('should save feed data 2', function(done) {
        var uri = 'http://www.aaronsw.com/2002/feeds/pgessays.rss';
        agg.runNow(uri, function(record, saved) {
            record.uri.should.equal(uri);
            feed.get(function(feeds) {
                var found = feeds.filter(function(record) {
                        return record.uri === uri;
                    });
                found.length.should.equal(1);
                post.get(uri, 0, -1, function(posts) {
                    posts.length.should.equal(saved);
                    done();
                });
            });
        });
    });
});

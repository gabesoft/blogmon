var should = require('should'),
    Feed = require('../lib/model/feed.js'),
    Post = require('../lib/model/post.js'),
    Aggregator = require('../lib/aggregator.js'),
    redis = require('./redis_helper.js').client(),
    feed = new Feed(redis),
    post = new Post(redis),
    agg  = new Aggregator(feed, post, 1);

agg.once('feed-updated', function(errors, feed, count) {
    console.log('updated', feed, count);
});
agg.once('feed-unchanged', function(errors, feed) {
    console.log('unchanged', feed);
});

describe('aggregator', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    xit('should save feed data', function(done) {
        var uri = 'http://robkuz-blog.blogspot.com/feeds/posts/default';
        agg.runNow(uri, function(errors, record, saved) {
            record.uri.should.equal(uri);
            feed.getAll(function(err, feeds) {
                var found = feeds.filter(function(feed) {
                    return feed.uri === uri;
                });
                found.length.should.equal(1);
                post.get(uri, 0, -1, function(err, posts) {
                    posts.length.should.equal(saved);
                    done();
                });
            });
        });
    });
});

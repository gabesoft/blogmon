var TEST_DB = 10,
    should = require('should'),
    Feed = require('../lib/model/feed.js'),
    Post = require('../lib/model/post.js'),
    Aggregator = require('../lib/aggregator.js'),
    eyes = require('eyes'),
    redis = require('redis').createClient(),
    trav = require('traverse'),
    feedData = require('./support/data_feed.js'),
    etags = feedData.etags,
    feeds = feedData.feeds,
    feed = new Feed(redis),
    post = new Post(redis),
    agg  = new Aggregator(feed, post, 1);

redis.select(TEST_DB);
redis.debug_mode = true;
redis.on('error', function(err) {
    console.log(err);
});

//agg.once('feed-updated', function(errors, feed, count) {
    //console.log();
    //console.log('UPDATED', feed, count);
//});
//agg.once('feed-unchanged', function(errors, feed) {
    //console.log();
    //console.log('UNCHANGED', feed);
//});

describe('aggregator', function() {
    beforeEach(function() {
        redis.flushdb();
    });

    it('should save feed data', function(done) {
        var uri = 'http://robkuz-blog.blogspot.com/feeds/posts/default';
        agg.runNow(uri, function(errors, saved) {
            feed.getall(function(err, feeds) {
              var found = feeds.filter(function(feed) {
                return feed.uri === uri;
              });
              found.length.should.equal(1);
              post.get(uri, 0, -1, function(err, posts) {
                posts.length.should.be.greaterThan(0);
                done();
              });
            });
        });
    });
});

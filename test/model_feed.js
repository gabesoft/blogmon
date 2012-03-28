var should = require('should'),
    Feed = require('../lib/model/feed.js'),
    eyes = require('eyes'),
    redis = require('./redis_helper.js').client(),
    trav = require('traverse'),
    feedData = require('./support/data_feed.js'),
    etags = feedData.etags,
    feeds = feedData.feeds,
    single = feedData.single,
    feed = new Feed(redis);

describe('feed', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    it('should return the count of subscribers when subscribing', function(done) {
        feed.subscribe(feeds, function(subscribers) {
            var counts = feeds.map(function (x) { return 1; });
            subscribers.length.should.equal(counts.length);
            subscribers.toString().should.equal(counts.toString());
            done();
        });
    });

    it('should subscribe to feeds', function(done) {
        feed.subscribe(feeds, function(subscribers) {
            feed.getAll(function(results) {
                results.length.should.equal(feeds.length);
                results.forEach(function(x) {
                    should.exist(x.uri);
                });
                done();
            });
        });
    });

    it('should add one feed but not subscribe to it', function(done) {
        feed.add(single, function(subscribers) {
            subscribers.should.equal(0);
            feed.getAll(function(results) {
                results
                   .filter(function(r) { return r.uri === single.uri; })
                   .length
                   .should
                   .equal(1);
                done();
            });
        });
    });

    it('should add a feed only once even if called multiple times', function(done) {
        feed.add(single, function() {
            feed.add(single, function() {
                feed.add(single, function() {
                    feed.getAll(function(results) {
                        results
                           .filter(function(r) { return r.uri === single.uri; })
                           .length
                           .should
                           .equal(1);
                        done();
                    });
                });
            });
        });
    });

    it('should increment subscribers when subscribing to existing feeds', function(done) {
        feed.subscribe(feeds, function(subscribers1) {
            feed.subscribe(feeds.slice(1), function(subscribers) {
                subscribers.length.should.equal(feeds.length - 1);
                subscribers.toString().should.equal('2,2');
                done();
            });
        });
    });

    it('should subscribe to feed by url', function(done) {
        feed.subscribe(feeds, function(subscribers1) {
            feed.subscribe(feeds[0].uri, function(subscribers) {
                subscribers.should.equal(2);
                feed.getAll(function(results) {
                    results.length.should.equal(feeds.length);
                    done();
                });
            });
        });
    });

    it('should subscribe to feed by feed', function(done) {
        feed.subscribe(feeds, function(subscribers1) {
            feed.subscribe(feeds[1], function(subscribers) {
                subscribers.should.equal(2);
                feed.getAll(function(results) {
                    results.length.should.equal(feeds.length);
                    done();
                });
            });
        });
    });

    it('should unsubscribe feed', function(done) {
        feed.subscribe(feeds, function(subscribers1) {
            feed.unsubscribe(feeds[0].uri, function(subscribers) {
                subscribers.should.equal(0);
                feed.getAll(function(results) {
                    results.length.should.equal(feeds.length - 1);
                    done();
                });
            });
        });
    });

    it('should update a feed', function(done) {
        feed.subscribe(feeds, function(subscribers1) {
            feed.getAll(function(results) {
                results[2].title = 'abc';
                feed.update(results[2], function(subscribers) {
                    subscribers.should.equal(1);
                    feed.getAll(function(updated) {
                        updated.length.should.equal(feeds.length);
                        updated[2].title.should.equal(results[2].title);
                        done();
                    });
                });
            });
        });
    });

    it('should set/get additional data for a feed', function(done) {
        feed.setData(feeds[0].uri, etags[0], function() {
            feed.getData(feeds[0].uri, function(d) {
                Object.keys(d).length.should.equal(2);
                d.lastModified.should.equal(etags[0].lastModified);
                d.etag.should.equal(etags[0].etag);
                done();
            });
        });
    });
});

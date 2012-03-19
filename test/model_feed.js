var TEST_DB = 10,
    should = require('should'),
    Feed = require('../lib/model/feed.js'),
    eyes = require('eyes'),
    redis = require('redis').createClient(),
    trav = require('traverse'),
    feed = new Feed(redis);

redis.select(TEST_DB);
redis.debug_mode = true;
redis.on('error', function(err) {
    console.log(err);
});

var etags = [ {
    lastModified: 'Fri, 16 Mar 2012 16:09:32 GMT',
    etag: '"e7216fef0ab0beef233b2a22704c87c2"'
  }, {
    lastModified: undefined,
    etag: undefined
  }, {
    lastModified: undefined,
    etag: '"rearden metal"'
} ];

var feeds = [ {
    uri: 'http://www.mikealrogers.com/site.rss',
    language: 'en-us',
    description: 'all things mikeal rogers.',
    author: 'mikeal.rogers@gmail.com',
    link: 'http://www.mikealrogers.com/',
    title: 'mikeal'
  }, {
    uri: 'http://blog.izs.me/rss',
    description: 'Writing from Isaac Z. Schlueter',
    link: 'http://blog.izs.me/',
    title: 'blog.izs.me'
  }, {
    uri: 'http://www.it-wars.com/feed.php?atom',
    description: "Les guerres d'un Responsable Informatique",
    link: 'http://www.it-wars.com/',
    title: 'IT Wars'
} ];

describe('feed', function() {
    beforeEach(function(done) {
        redis.flushdb();
        feed.subscribe(feeds, function(err, subscribers) {
            var counts = feeds.map(function (x) { return 1; });
            subscribers.length.should.equal(counts.length);
            subscribers.toString().should.equal(counts.toString());
            done();
        });
    });

    it('should subscribe to feeds', function(done) {
        feed.getall(function(err, results) {
            results.length.should.equal(feeds.length);
            results.forEach(function(x) {
                should.exist(x.uri);
            });
            done();
        });
    });

    it('should increment subscribers when subscribing to existing feeds', function(done) {
        feed.subscribe(feeds.slice(1), function(err, subscribers) {
          subscribers.length.should.equal(feeds.length - 1);
          subscribers.toString().should.equal('2,2');
          done();
        });
    });

    it('should subscribe to feed by url', function(done) {
        feed.subscribe(feeds[0].uri, function(err, subscribers) {
            subscribers.should.equal(2);
            feed.getall(function(err, results) {
                results.length.should.equal(feeds.length);
                done();
            });
        });
    });

    it('should subscribe to feed by feed', function(done) {
        feed.subscribe(feeds[1], function(err, subscribers) {
            subscribers.should.equal(2);
            feed.getall(function(err, results) {
                results.length.should.equal(feeds.length);
                done();
            });
        });
    });

    it('should unsubscribe feed', function(done) {
        feed.unsubscribe(feeds[0].uri, function(err, subscribers) {
            subscribers.should.equal(0);
            feed.getall(function(err, results) {
                results.length.should.equal(feeds.length - 1);
                done();
            });
        });
    });

    it('should update a feed', function(done) {
        feed.getall(function(err, results) {
            results[2].title = 'abc';
            feed.update(results[2], function(err) {
                feed.getall(function(err, updated) {
                    updated[2].title.should.equal(results[2].title);
                    done();
                });
            });
        });
    });

    it('should set/get additional data for a feed', function(done) {
        feed.setData(feeds[0], etags[0], function(err) {
            feed.getData(feeds[0], function(err, d) {
                Object.keys(d).length.should.equal(2);
                d.lastModified.should.equal(etags[0].lastModified);
                d.etag.should.equal(etags[0].etag);
                done();
            });
        });
    });
});

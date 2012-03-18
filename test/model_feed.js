var TEST_DB = 10,
    should = require('should'),
    Feed = require('../lib/model/feed.js'),
    redis = require('redis').createClient(),
    trav = require('traverse'),
    feed = new Feed(redis);

redis.select(TEST_DB);

var data = [ {
    lastModified: 'Fri, 16 Mar 2012 16:09:32 GMT',
    etag: '"e7216fef0ab0beef233b2a22704c87c2"',
    uri: 'http://www.mikealrogers.com/site.rss',
    meta: {
      language: 'en-us',
      description: 'all things mikeal rogers.',
      author: 'mikeal.rogers@gmail.com',
      link: 'http://www.mikealrogers.com/',
      title: 'mikeal'
    }
  }, {
    lastModified: undefined,
    etag: undefined,
    uri: 'http://blog.izs.me/rss',
    meta: {
      description: 'Writing from Isaac Z. Schlueter',
      link: 'http://blog.izs.me/',
      title: 'blog.izs.me'
    }
  }, {
    lastModified: undefined,
    etag: undefined,
    uri: 'http://www.it-wars.com/feed.php?atom',
    meta: {
      description: "Les guerres d'un Responsable Informatique",
      link: 'http://www.it-wars.com/',
      title: 'IT Wars'
    }
} ];

describe('feed', function() {
    beforeEach(function() {
        redis.flushdb();
        data.forEach(function(d) {
            delete d.id;
        });
    });

    it('should add feeds', function(done) {
        feed.set(data, function(err, addCount, keyCount) {
            data.forEach(function(x) {
                x.id.should.be.a('string');
            });
            addCount.should.equal(3);
            keyCount.should.equal(3);
            done();
        });
    });

    it('should modify feeds', function(done) {
        feed.set(data, function() {
            var copy = trav(data).clone();
            copy.push({
                lastModified: undefined,
                etag: undefined,
                uri: 'http://www.it-wars.com/feed.php?atom2'
            });
            feed.set(copy, function(err, addCount, keyCount) {
                addCount.should.equal(4);
                keyCount.should.equal(4);
                feed.len(function(err, count) {
                    count.should.equal(4);
                    done();
                });
            });
        });
    });

    it('should get feeds', function(done) {
        feed.set(data, function() {
            feed.get(function(err, items) {
                items.length.should.equal(3);
                done();
            });
        });
    });
});

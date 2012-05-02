var should   = require('should')
  , Feed     = require('../lib/model/feed.js')
  , eyes     = require('eyes')
  , redis    = require('./redis_helper.js').client()
  , trav     = require('traverse')
  , util     = require('../lib/util.js')
  , feedData = require('./support/data_feed.js')
  , etags    = feedData.etags
  , feeds    = feedData.feeds
  , single   = feedData.single
  , repo     = new Feed(redis);

describe('feed', function() {
    beforeEach(function(done) {
        redis.flushdb(function() {
            feeds.forEach(function(feed) { delete feed.id; });
            delete single.id;
            done();
        });
    });

    it('should populate feed id when adding a feed', function(done) {
        repo.add(single, function() {
            should.exist(single.id);
            single.id.should.be.a('number');
            done();
        });
    });

    it('should get one feed by uri', function(done) {
        repo.add(feeds, function() {
            var feed = feeds[1];
            repo.get(feed.uri, function(copy) {
                copy.id.should.equal(feed.id);
                done();
            });
        });
    });

    it('should get a feed by id', function(done) {
        repo.add(feeds, function() {
            var feed = feeds[1];
            repo.get(feed.id, function(copy) {
                copy.uri.should.equal(feed.uri);
                done();
            });
        });
    });

    it('should get a feed by id in string format', function(done) {
        repo.add(feeds, function() {
            var feed = feeds[1];
            repo.get(feed.id + '', function(copy) {
                copy.uri.should.equal(feed.uri);
                copy.id.should.equal(feed.id);
                done();
            });
        });
    });

    it('should get multiple feeds by uri', function(done) {
        repo.add(feeds, function() {
            var uris = feeds.map(function(r) { return r.uri; });
            repo.get(uris, function(records) {
                uris.length.should.equal(records.length);
                done();
            });
        });
    });

    it('should get null for non existing feeds', function(done) {
        repo.add(feeds, function() {
            var uris = util.pluck(feeds, 'uri');
            uris.push('a');
            uris.push('b');
            repo.get(uris, function(records) {
                var empty = records.filter(function(r) { return r === null; });
                records.length.should.equal(uris.length);
                empty.length.should.equal(2);
                done();
            });
        });
    });

    it('should return null if the required feed does not exist', function(done) {
        repo.add(feeds, function() {
            repo.get('invalid', function(records) {
                should.not.exist(records);
                done();
            });
        });
    });

    it('should get multiple feeds by id', function(done) {
        repo.add(feeds, function() {
            var ids = feeds.map(function(r) { return r.id; });
            repo.get(ids, function(records) {
                ids.length.should.equal(records.length);
                done();
            });
        });
    });

    it('should get all feeds', function(done) {
        repo.add(feeds, function() {
            repo.get(function(all) {
                all.length.should.equal(feeds.length);
                done();
            });
        });
    });

    it('should add one feed', function(done) {
        repo.add(single, function() {
            repo.get(function(all) {
                all.length.should.equal(1);
                all[0].uri.should.equal(single.uri);
                all[0].id.should.equal(single.id);
                done();
            });
        });
    });

    it('should add multiple feeds', function(done) {
        repo.add(feeds, function() {
            repo.get(function(all) {
                all.length.should.equal(feeds.length);
                done();
            });
        });
    });

    it('should add a feed only once even if called multiple times', function(done) {
        repo.add(single, function() {
            repo.add(single, function() {
                repo.add(single, function() {
                    repo.get(function(all) {
                        all.length.should.equal(1);
                        all[0].uri.should.equal(single.uri);
                        all[0].id.should.equal(single.id);
                        done();
                    });
                });
            });
        });
    });

    it('should update when adding an existing feed', function(done) {
        repo.add(single, function() {
            repo.get(single.id, function(feed) {
                feed.date = new Date();
                delete feed.id;
                repo.add(feed, function() {
                    feed.id.should.equal(single.id);
                    repo.get(feed.id, function(copy) {
                        copy.date.valueOf().should.equal(feed.date.valueOf());
                        copy.date.valueOf().should.not.equal(single.date.valueOf());
                        done();
                    });
                });
            });
        });
    });

    it('should update a feed', function(done) {
        repo.add(feeds, function() {
            repo.get(function(all) {
                var feed = all[2];
                feed.title = 'abc';
                repo.update(feed, function() {
                    repo.get(feed.id, function(copy) {
                        copy.title.should.equal(feed.title);
                        done();
                    });
                });
            });
        });
    });
});

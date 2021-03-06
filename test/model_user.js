var should   = require('should')
  , eyes     = require('eyes')
  , redis    = require('./redis_helper.js').client()
  , feedData = require('./support/data_feed.js')
  , feeds    = feedData.feeds
  , User     = require('../lib/model/user.js')
  , user     = new User(redis);

var data = [ 
        { name: 'u1', pass: 'p1' },
        { name: 'u2', pass: 'p2' }
    ];

describe('user', function() {
    beforeEach(function(done) {
        redis.flushdb(function() {
            user.create(data[1].name, data[1].pass, done);
        });
    });

    it('should create a user', function(done) {
        user.create(data[0].name, data[0].pass, function(err, record) {
            record.name.should.equal(data[0].name);
            record.should.have.property('pass');
            record.pass.should.not.equal(data[0].pass);
            record.pass.should.be.a('string');
            done();
        });
    });

    it('should get all user names', function(done) {
        user.create(data[0].name, data[0].pass, function() {
            user.create(data[1].name, data[1].pass, function() {
                user.names(function(names) {
                    var actual = names;
                    var expected = [data[0].name, data[1].name];

                    actual.sort();
                    expected.sort();

                    actual.should.eql(expected);
                    done();
                });
            });
        });
    });

    it('should not create a user with an existing name', function(done) {
        user.create(data[0].name, data[0].pass, function(err1, user1) {
            user.create(data[0].name, data[0].pass, function(err2, user2) {
                should.not.exist(err1);
                should.exist(err2);
                err2.message.should.include(data[0].name);
                done();
            });
        });
    });

    it('should authenticate a user with valid password', function(done) {
        user.authenticate(data[1].name, data[1].pass, function(record) {
            should.exist(record);
            record.name.should.equal(data[1].name);
            done();
        });
    });

    it('should not authenticate a user with invalid password', function(done) {
        user.authenticate(data[1].name, 'invalid', function(record) {
            should.not.exist(record);
            done();
        });
    });

    it('should not authenticate a non-existent user', function(done) {
        user.authenticate('non-user', 'invalid', function(record) {
            should.not.exist(record);
            done();
        });
    });

    it('should get a user by name', function(done) {
        user.get(data[1].name, function(record) {
            should.exist(record);
            record.name.should.equal(data[1].name);
            done();
        });
    });

    it('should subscribe to feed', function(done) {
        user.subscribe(data[1].name, feeds[0].uri, function(feeds1) {
            feeds1.length.should.equal(1);
            feeds1[0].should.equal(feeds[0].uri);
            done();
        });
    });

    it('should allow multiple subscriptions to the same feed', function(done) {
        user.subscribe(data[1].name, feeds[0].uri, function(feeds1) {
            user.subscribe(data[1].name, feeds[0].uri, function(feeds2) {
                feeds2.length.should.equal(1);
                done();
            });
        });
    });

    it('should unsubscribe from feed', function(done) {
        user.subscribe(data[1].name, feeds[0].uri, function(feeds1) {
            user.subscribe(data[1].name, feeds[1].uri, function(feeds2) {
                user.unsubscribe(data[1].name, feeds[0].uri, function(feeds3) {
                    feeds3.length.should.equal(1);
                    feeds3[0].should.equal(feeds[1].uri);
                    done();
                });
            });
        });
    });

    it('should populate subscribed feeds when getting by name', function(done) {
        user.subscribe(data[1].name, feeds[0].uri, function(feeds1) {
            user.subscribe(data[1].name, feeds[1].uri, function(feeds2) {
                user.get(data[1].name, function(record) {
                    should.exist(record.feeds);
                    record.feeds.length.should.equal(2);
                    done();
                });
            });
        });
    });
});

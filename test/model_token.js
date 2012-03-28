var should  = require('should'),
    trav    = require('traverse'),
    eyes    = require('eyes'),
    redis   = require('./redis_helper.js').client(),
    Token   = require('../lib/model/token.js'),
    token   = new Token(redis),
    user    = 'user1';

describe('token', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    it('should create a token', function(done) {
        token.create(user, function(token1) {
            should.exist(token1);
            token1.should.have.property('name');
            token1.should.have.property('series');
            token1.should.have.property('id');
            token1.should.have.property('date');
            token1.name.should.equal(user);
            token.verify(token1, function(err, token2) {
                token2.date.should.be.an['instanceof'](Date);
                should.exist(token2);
                done();
            });
        });
    });

    it('should change token on update but maintain series', function(done) {
        token.create(user, function(token1) {
            token.update(token1, function(token2) {
                token1.series.should.equal(token2.series);
                token1.id.should.not.equal(token2.id);
                done();
            });
        });
    });

    it('should remove token', function(done) {
        token.create(user, function(token1, count1) {
            token.remove(token1, function() {
                token.verify(token1, function(err, token2) {
                    should.not.exist(token2);
                    done();
                });
            });
        });
    });

    it('should remove all tokens for a user name', function(done) {
        token.create(user, function(token1) {
            token.create(user, function(token2) {
                token.removeAll(user, function(count) {
                    count.should.equal(2);
                    token.verify(token1, function(err1, token4) {
                        should.not.exist(token4);
                        token.verify(token2, function(err2, token5) {
                            should.not.exist(token5);
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should verify valid token', function(done) {
        token.create(user, function(token1) {
            token.verify(token1, function(err1, token2) {
                should.exist(token2);
                token.create(user, function(token3) {
                    token.verify(token1, function(err2, token4) {
                        should.exist(token4);
                        done();
                    })
                });
            });
        });
    });

    it('should fail to verify invalid token', function(done) {
        token.create(user, function(token1) {
            var t1 = trav(token1).clone(),
                t2 = trav(token1).clone();
            t1.id = 'invalid';
            t2.series = 'invalid';
            token.verify(t1, function(err2, token2) {
                should.not.exist(token2);
                token.verify(t2, function(err3, token3) {
                    should.not.exist(token3);
                    done();
                });
            });
        });
    });

    it('should create tokens for the same user with different series', function(done) {
        token.create(user, function(token1) {
            token.create(user, function(token2) {
                token2.series.should.not.equal(token1.series);
                done();
            });
        });
    });

    it('should detect identity theft', function(done) {
        token.create(user, function(token1) {
            token.update(token1, function(token2) {
                token.verify(token1, function(err3, token3) {
                    should.not.exist(token3);
                    err3.message.should.equal('possible identity theft detected');
                    done();
                });
            });
        });
    });

    it('should return the count of sessions in progress', function(done) {
        token.create(user, function(token1) {
            token.create(user, function(token2) {
                token.create(user, function(token3) {
                    token.count(user, function(count) {
                        count.should.equal(3);
                        done();
                    });
                });
            });
        });
    });
});

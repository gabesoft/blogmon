var TEST_DB = 10,
    should = require('should'),
    eyes = require('eyes'),
    redis = require('redis').createClient(),
    User = require('../lib/model/user.js'),
    user = new User(redis);

var data = [ 
    { name: 'u1', pass: 'p1' },
    { name: 'u2', pass: 'p2' }
];

redis.select(TEST_DB);
redis.debug_mode = true;
redis.on('error', function(err) { console.log(err); });

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
        user.authenticate(data[1].name, data[1].pass, function(err, record) {
            should.exist(record);
            record.name.should.equal(data[1].name);
            done();
        });
    });

    it('should not authenticate a user with invalid password', function(done) {
        user.authenticate(data[1].name, 'invalid', function(err, record) {
            should.not.exist(record);
            done();
        });
    });

    it('should not authenticate a non-existent user', function(done) {
        user.authenticate('non-user', 'invalid', function(err, record) {
            should.not.exist(record);
            done();
        });
    });
});

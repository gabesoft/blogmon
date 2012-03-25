var COOKIE = 'login-token',
    should = require('should'),
    eyes   = require('eyes'),
    redis  = require('./redis_helper').client(),
    auth   = require('../lib/app/auth.js')(redis),
    users  = require('../lib/model/user.js')(redis),
    req    = null,
    res    = null,
    error  = function() { throw new Error(); };
var user   = {
    name: 'dagny',
    pass: 'purpose'
};
var checkContextEmpty = function() {
    should.not.exist(res.cookies[COOKIE]);
    should.not.exist(req.session.user);
};
var checkContextHasUser = function() {
    var cookie = res.cookies[COOKIE];
    should.exist(cookie);
    should.exist(req.session.user);
    cookie.should.include(user.name);
    req.session.user.name.should.equal(user.name);
};
var initSession = function(callback) {
    req.session = {
        destroy: initSession
    };
    callback();
};

describe('auth', function() {
    beforeEach(function(done) {
        req  = { body: {}, cookies: {} };
        res  = { 
            cookies: {},
            cookie: function(name, data, opts) {
                this.cookies = {};
                this.cookies[name] = data;
            },
            clearCookie: function(name) {
                delete this.cookies[name];
            }
        };
        initSession(function() {});
        redis.flushdb(function() {
            users.create(user.name, user.pass, function(err) {
                done();
            });
        });
    });

    it('should authenticate successfully current session user', function(done) {
        req.session.user = user;
        auth.authenticate(req, res, done, error);
    });

    it('should authenticate successfully from cookie', function(done) {
        auth.init(req, res, user, function() {
            delete req.session.user;
            req.cookies[COOKIE] = res.cookies[COOKIE];
            auth.authenticate(req, res, function() {
                checkContextHasUser();
                done();
            }, error);
        });
    });

    it('should fail to authenticate when no credentials are present', function(done) {
        auth.authenticate(req, res, error, done);
    });

    it('should log in a user with valid credentials', function(done) {
        req.body.user = user;
        auth.login(req, res, function() {
            checkContextHasUser();
            done();
        }, error);
    });

    it('should not log in a user with invalid credentials', function(done) {
        req.body.user = { name: 'unknown', pass: 'invalid' };
        auth.login(req, res, error, function() {
            checkContextEmpty();
            done();
        });
    });

    it('should log out a logged in user', function(done) {
        req.body.user = user;
        auth.login(req, res, function() {
            req.cookies[COOKIE] = res.cookies[COOKIE];
            auth.logout(req, res, function() {
                checkContextEmpty();
                done();
            });
        });
    });

    it('should initialize session with a given user', function(done) {
        auth.init(req, res, user, function() {
            checkContextHasUser();
            done();
        });
    });
});

module.exports = function(redis) {
    var COOKIE = 'login-token',
        tokens = require('../model/token.js')(redis),
        users  = require('../model/user.js')(redis),
        util   = require('../util.js');

    var cookie = {
        has: function(req) { return util.exists(this.get(req)); },
        get: function(req) { return req.cookies[COOKIE]; },
        del: function(res) { res.clearCookie(COOKIE); },
        put: function(res, data) {
            res.cookie(COOKIE, data, {
                expires: new Date(Date.now() + 2 * 604800000),
                path   : '/'
            });
        }
    };

    var init = function(req, res, user, token) {
        cookie.put(res, tokens.toStr(token));
        req.session.user = user;
    };

    var auth = function(req, res, token, succ, fail) {
        tokens.verify(token, function(err, verified) {
            if (util.exists(verified)) {
                users.get(token.name, function(user) {
                    if (util.exists(user)) {
                        tokens.update(token, function(updated) {
                            init(req, res, user, updated);
                            succ();
                        });
                    } else {
                        fail();
                    }
                });
            } else {
                fail();
            }
        });
    }

    return {
        authenticate: function(req, res, succ, fail) {
            var token;
            if (util.exists(req.session.user)) {
                succ();
            } else if (cookie.has(req)) {
                token = tokens.parse(cookie.get(req));
                auth(req, res, token, succ, fail);
            } else {
                fail();
            }
        },

        login: function(req, res, succ, fail) {
            var cred = req.body.user;
            users.authenticate(cred.name, cred.pass, function(user) {
                if (util.exists(user)) {
                    tokens.create(user.name, function(token) {
                        init(req, res, user, token);
                        succ();
                    });
                } else {
                    fail();
                }
            });
        },

        logout: function(req, res, next) {
            req.session.destroy(function() {
                if (cookie.has(req)) {
                    tokens.remove(tokens.parse(cookie.get(req)), function() {
                        cookie.del(res);
                        next();
                    });
                } else {
                    next();
                }
            });
        },

        init: function(req, res, user, next) {
            tokens.create(user.name, function(token) {
                init(req, res, user, token);
                next();
            });
        }
    };
};

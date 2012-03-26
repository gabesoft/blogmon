module.exports = function(app, redis) {
    var auth   = require('./auth.js')(redis),
        util   = require('../util.js'),
        expose = require('express-expose');

    var authenticate = function(req, res, next) {
      var succ = function() { next(); };
      var fail = function() { res.redirect('/session/new'); };
      auth.authenticate(req, res, succ, fail);
    };

    app.get('/', authenticate, function(req, res) {
        res.expose({ user: req.session.user.name });
        res.render('index', {
            title: 'Blog Monitor',
            titleInfo: req.session.user.name,
            layout: 'layouts/main'
        });
    });
};

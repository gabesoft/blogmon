module.exports = function(app, redis) {
    var auth   = require('./auth.js')(redis),
        util   = require('../util.js'),
        feeds  = require('../model/feed.js')(redis),
        expose = require('express-expose');

    var authenticate = function(req, res, next) {
      var succ = function() { next(); };
      var fail = function() { res.redirect('/session/new'); };
      auth.authenticate(req, res, succ, fail);
    };

    /*
     * Renders the index page.
     */
    app.get('/', authenticate, function(req, res) {
        res.expose({ user: req.session.user.name });
        res.render('index', {
            title: 'Blog Monitor',
            titleInfo: req.session.user.name,
            layout: 'layouts/main'
        });
    });

    /*
     * Returns the list of feeds that the current user subscribes to.
     */
    app.get('/feeds', authenticate, function(req, res) {
      
    });

    /*
     * Subscribes the current user to a new feed.
     */
    app.post('/feeds', authenticate, function(req, res) {
      
    });

    /*
     * Unsubscribes the current user from the specified feed.
     */
    app.del('/feeds/:id', authenticate, function(req, res) {
        var id = req.params.id;
    });
};

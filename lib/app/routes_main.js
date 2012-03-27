module.exports = function(app, redis) {
    var auth   = require('./auth.js')(redis),
        util   = require('../util.js'),
        feeds  = require('../model/feed.js')(redis),
        Finder = require('../feed_finder.js'),
        finder = new Finder(),
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
        var feeds = req.session.user.feeds,
            subscribed = util.toHash(feeds);

        feeds.getAll(function(err, all) {
            var subscribed = all.filter(function(feed) { 
                return subscribes[feed.uri];
            });
            res.send(subscribed);
        });
    });

    /*
     * Subscribes the current user to a new feed.
     */
    app.post('/feeds', authenticate, function(req, res) {
        var query = req.params.feed,
            user  = req.session.user;
        finder.find(query, function(feedUrl) {
            if (util.nil(feedUrl)) {
                res.send({ success: false });
            } else {
                agg.runNow(feedUr, function(err1, feed) {
                    feeds.subscribe(feed, function(err2) {
                        users.subscribe(user.name, feed.uri, function(err3, feeds) {
                            user.feeds = feeds;
                            res.send({ success: true, feed: feed });
                        });
                    });
                });
            }
        });
    });

    /*
     * Unsubscribes the current user from the specified feed.
     */
    app.del('/feeds/:id', authenticate, function(req, res) {
        var uri  = req.params.id,
            user = req.session.user;
        feeds.unsubscribe(uri, function(err1) {
            users.unsubscribe(user.name, uri, function(err2, feeds) {
                user.feeds = feeds;
                res.send({ success: true });
            });
        });
    });
};

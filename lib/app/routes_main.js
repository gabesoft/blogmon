module.exports = function(app) {
    var auth   = app.modules.auth
      , util   = app.modules.util
      , feeds  = app.modules.feeds
      , posts  = app.modules.posts
      , users  = app.modules.users
      , agg    = app.modules.agg
      , Finder = require('../feed_finder.js')
      , finder = new Finder()
      , expose = require('express-expose')

      , authenticate = function(req, res, next) {
            var succ = function() { next(); }
              , fail = function() { res.redirect('/session/new'); };
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
     * Returns the list of posts for the feeds that the current user subscribes to.
     */
    app.get('/posts', authenticate, function(req, res) {
        var userFeeds = req.session.user.feeds
          , start     = parseInt(req.query.start || '0', 10)
          , limit     = parseInt(req.query.limit || '200', 10);
        posts.get(userFeeds, start, limit, function(postList) {
            res.send(postList);
        });
    });

    /*
     * Returns the list of feeds that the current user subscribes to.
     */
    app.get('/feeds', authenticate, function(req, res) {
        var userFeeds = req.session.user.feeds;
        feeds.get(userFeeds, function(subscribed) {
            res.send(subscribed);
        });
    });

    /*
     * Subscribes the current user to a new feed.
     */
    app.post('/feeds', authenticate, function(req, res) {
        var query = req.body.uri
          , user  = req.session.user
          , send  = function(feed) {
                users.subscribe(user.name, feed.uri, function(feeds) {
                    user.feeds = feeds;
                    res.send(feed);
                });
            };

        finder.find(query, function(uri) {
            if (util.nil(uri)) {
                res.send('Could not find a feed matching ' + query, 404);
            } else {
                feeds.get(uri, function(feed) {
                    if (util.nil(feed)) {
                        agg.runNow(uri, send);
                    } else {
                        send(feed);
                    }
                });
            }
        });
    });

    /*
     * Unsubscribes the current user from the specified feed.
     */
    app.del('/feeds/:id', authenticate, function(req, res) {
        var id   = req.params.id,
            user = req.session.user;
        feeds.get(id, function(feed) {
            users.unsubscribe(user.name, feed.uri, function(feeds) {
                user.feeds = feeds;
                res.send({ success: true });
            });
        });
    });
};

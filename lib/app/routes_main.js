module.exports = function(app) {
    var auth   = app.modules.auth
      , util   = app.modules.util
      , eyes   = require('eyes')
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
     * Returns all feeds that match a search query.
     */
    app.get('/feeds/search', function(req, res) {
        finder.find(req.query.searchText, function(feeds) {
            res.send(feeds);
        });
    });

    /*
     * Subscribes the current user to a new feed.
     */
    app.post('/feeds', authenticate, function(req, res) {
        var uri = req.body.uri
          , user  = req.session.user
          , fail  = function() {
                res.send('Could not read blog at ' + uri, 404);
            }
          , send  = function(feed) {
                if (util.nil(feed) || util.nil(feed.id)) {
                    fail();
                } else {
                    users.subscribe(user.name, feed.uri, function(feeds) {
                        user.feeds = feeds;
                        res.send(feed);
                    });
                }
            };

        if (util.nil(uri)) {
            fail();
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

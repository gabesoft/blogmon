module.exports = function(app) {
    var auth           = app.modules.auth
      , util           = app.modules.util
      , eyes           = require('eyes')
      , feeds          = app.modules.feeds
      , posts          = app.modules.posts
      , users          = app.modules.users
      , agg            = app.modules.agg
      , SettingsHelper = require('./user_settings_helper.js')
      , Finder         = require('../feed_finder.js')
      , finder         = new Finder()
      , expose         = require('express-expose')

      , authenticate = function(req, res, next) {
            var succ = function() { next(); }
              , fail = function() { res.redirect('/session/new'); };
            auth.authenticate(req, res, succ, fail);
        }

      , setSettings = function(type, req, res) {
            var id       = req.params.id
              , user     = req.session.user
              , settings = new SettingsHelper(app.modules.redis, user.name)
              , data     = req.body.settings;

            data.visible = data.visible === 'true';
            settings.set(type, id, data, function() {
                res.send({ success: true });
            });
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
        var user      = req.session.user
          , settings  = new SettingsHelper(app.modules.redis, user.name)
          , start     = parseInt(req.query.start || '0', 10)
          , limit     = parseInt(req.query.limit || '20', 10);

        users.feeds(user.name, function(uris) {
            settings.getMap('feed', uris, function(map) {
                var visible = uris.filter(function(uri) {
                        return map[uri].settings.visible;
                    });
                posts.get(visible, start, limit, function(postList) {
                    settings.populate('post', postList, function(list) {
                        res.send(list);
                    });
                });
            });
        });
    });

    /*
     * Returns a post entry description.
     */
    app.get('/posts/:id/description', function(req, res) {
        posts.getDescription(req.params.id, function(desc) {
            res.send(desc);
        });
    });

    /*
     * Updates the settings for a blog post.
     */
    app.post('/posts/:id/settings', authenticate, function(req, res) {
        setSettings('post', req, res);
    });

    /*
     * Updates the settings for a feed.
     */
    app.post('/feeds/:id/settings', authenticate, function(req, res) {
        setSettings('feed', req, res);
    });

    /*
     * Returns the list of feeds that the current user subscribes to.
     */
    app.get('/feeds', authenticate, function(req, res) {
        var user      = req.session.user
          , settings  = new SettingsHelper(app.modules.redis, user.name);

        users.feeds(user.name, function(uris) {
            feeds.get(uris, function(subscribed) {
                var filtered = subscribed.filter(util.exists);
                settings.populate('feed', filtered, function(list) {
                    res.send(list);
                });
            });
        });
    });

    /*
     * Returns all feeds that match a search query.
     */
    app.get('/feeds/search', function(req, res) {
        finder.find(req.query.searchText, function(results) {
            var uris = util.pluck(results, 'uri');
            feeds.get(uris, function(existing) {
                var map = util.toMap(existing
                    , function(r) { return r.uri; }
                    , function(r) { return r; }
                    , util.exists
                    );

                results.forEach(function(r) {
                    if (util.exists(map[r.uri])) {
                        util.extend(r, map[r.uri]);
                    } else {
                        r.id = null;
                    }
                });
                res.send(results);
            });
        });
    });

    /*
     * Subscribes the current user to a new feed.
     */
    app.post('/feeds', authenticate, function(req, res) {
        var data = req.body.data
          , uri  = data.uri
          , user = req.session.user
          , fail = function() {
                data.error = { message: 'Failed to subscribe to blog' };
                res.send(data);
            }
          , send = function(feed) {
                if (util.nil(feed) || util.nil(feed.id)) {
                    fail();
                } else {
                    users.subscribe(user.name, feed.uri, function(feeds) {
                        // TODO: also set visible to true
                        res.send(feed);
                    });
                }
            };

        if (util.nil(uri)) {
            fail();
        } else {
            feeds.get(uri, function(feed) {
                if (util.nil(feed)) {
                    agg.runNow(data, send);
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
        var id   = req.params.id
          , user = req.session.user;
        feeds.get(id, function(feed) {
            users.unsubscribe(user.name, feed.uri, function(feeds) {
                res.send({ success: true });
            });
        });
    });
};

var eyes = require('eyes');

module.exports.initModules = function(app) {
    var Agg   = require('../aggregator.js')
      , redis = require('./redis_helper.js')(app)
      , db    = redis.client(app.set('redisdb'))
      , util  = require('../util.js')
      , Feed  = require('../model/feed.js')
      , Post  = require('../model/post.js')
      , User  = require('../model/user.js')
      , feeds = new Feed(db)
      , posts = new Post(db)
      , users = new User(db)
      , auth  = require('./auth.js')(db)
      , Hook  = require('hook.io').Hook
      , hook = new Hook({
            name  : 'blogmon-hook'
          , debug : false
          , silent: true
        })
      , agg   = new Agg(db, 600); // TODO: increase timeout to 1 hour
    //, agg   = new Agg(db, 30); // TODO: increase timeout to 1 hour

    require('console-trace');

    console.traceAlways = true;
    console.traceColors = false;

    hook.on('hook::ready', function() {
        hook.emit('feed reader activity ready');

        agg.on('feed-updated', function(feed, count) {
            hook.emit('feed-updated', { 
                feed: feed
              , count: count
            });
        });
        agg.on('feed-unchanged', function(feed) {
            hook.emit('feed-unchanged', feed);
        });
    });
    hook.start();

    app.modules              = {};
    app.modules.agg          = agg;
    app.modules.auth         = auth;
    app.modules.util         = util;
    app.modules.redis_helper = redis;
    app.modules.redis        = db;
    app.modules.feeds        = feeds;
    app.modules.posts        = posts;
    app.modules.users        = users;
    app.modules.hook         = hook;
};

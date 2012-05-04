var eyes = require('eyes');

module.exports.initModules = function(app) {
    var Agg   = require('../aggregator.js'),
        redis = require('./redis_helper.js'),
        db    = redis.client(app.set('redisdb')),
        util  = require('../util.js'),
        Feed  = require('../model/feed.js'),
        Post  = require('../model/post.js'),
        User  = require('../model/user.js'),
        feeds = new Feed(db),
        posts = new Post(db),
        users = new User(db),
        auth  = require('./auth.js')(db),
        agg   = new Agg(db, 600); // TODO: increase timeout to 1 hour

    require('console-trace');

    console.traceAlways = true;
    console.traceColors = false;

    agg.on('feed-updated', function(feed, count) {
        console.log('updated', feed, count);
    });
    agg.on('feed-unchanged', function(feed) {
        console.log('unchanged', feed);
    });

    app.modules = {};
    app.modules.agg   = agg;
    app.modules.auth  = auth;
    app.modules.util  = util;
    app.modules.redis = db;
    app.modules.feeds = feeds;
    app.modules.posts = posts;
    app.modules.users = users;
};

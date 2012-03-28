(function() {
    var express = require('express'),
        app     = module.exports = express.createServer(),
        port    = process.env.PORT || 3000,
        bundle  = require('browserify'),
        config  = require('./lib/app/config.js'),
        routes  = require('./lib/app/routes.js'),
        redis   = require('./lib/app/redis_helper.js');

    config(app, express);

    Aggregator = require('./lib/aggregator.js');
    db         = redis.client(app.set('redisdb'));
    Feed       = require('./lib/model/feed.js');
    Post       = require('./lib/model/post.js');
    feed       = new Feed(db);
    post       = new Post(db);
    agg        = new Aggregator(feed, post, 600); // TODO: increase timeout to 1 hour

    agg.on('feed-updated', function(feed, count) {
        console.log('updated', feed, count);
    });
    agg.on('feed-unchanged', function(feed) {
        console.log('unchanged', feed);
    });

    routes(app, db, agg);

    agg.run();

    app.listen(port, function() {
        console.log("Express server listening on port %d in %s mode", 
            app.address().port, app.settings.env);
    });

    app.use(bundle({
        entry: __dirname + '/pub/app/app.js',
        debug: false,
        mount: '/all.js',
        require: { jquery: 'br-jquery' }
    }));
}).call(this);

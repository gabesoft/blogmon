module.exports = function(app, express) {

    var stylus = require('stylus')
      , url    = require('url')
      , eyes   = require('eyes')
      , expose = require('express-expose')
      , util   = require('../util.js')
      , redis  = require('./redis_helper.js')(app)
      , nib    = require('nib');

    app.configure(function() {
        app.set('views', __dirname + '/../../pub/views');
        app.set('view engine', 'jade');
        app.set('view options', { pretty: true, layout: true });
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        app.use(express.cookieParser());
        app.use(express.session({
            secret: 'secret'
          , store : redis.store(express)
          , cookie: { maxAge: 900000 }
        }));
        app.use(app.router);
        app.use(express.static(__dirname + '/../../pub'));

        app.use(function(err, req, res, next) {
            if (util.exists(err)) {
                app.modules.hook.emit('server-error', { 
                    error: err.message
                  , code: err.code 
                });
            }
            next(err);
        });
    });

    app.configure('test', function() {
        app.use(express.logger());
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.set('redisdb', 2);
    });

    app.configure('development', function() {
        app.use(express.logger());
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        app.set('redisdb', 1);
    });

    app.configure('production', function() {
        app.use(express.logger());
        app.use(express.errorHandler());
        app.set('redisdb', 0);
    });

    app.dynamicHelpers({
        session: function(req, res) {
            return req.session;
        }
      , flash: function(req, res) {
            return req.flash();
        }
    });
};

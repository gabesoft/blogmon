(function() {
    var express = require('express'),
        app     = module.exports = express.createServer(),
        port    = process.env.PORT || 3000,
        bundle  = require('browserify'),
        config  = require('./lib/app/config.js'),
        routes  = require('./lib/app/routes.js');

    config(app, express);
    routes(app);

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

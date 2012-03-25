(function() {
    var express = require('express'),
        app     = module.exports = express.createServer(),
        port    = process.env.PORT || 3000,
        config  = require('./lib/app/config.js'),
        routes  = require('./lib/app/routes.js');

    config(app, express);
    routes(app);

    app.listen(port, function() {
        console.log("Express server listening on port %d in %s mode", 
          app.address().port, app.settings.env);
    });
}).call(this);

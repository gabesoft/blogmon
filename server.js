(function() {
    var express = require('express'),
        app     = module.exports = express.createServer(),
        port    = process.env.PORT || 3000;

    // TODO: add routes
    //       add config

    app.listen(port, function() {
        console.log("Express server listening on port %d in %s mode", 
          app.address().port, app.settings.env);
    });
};)

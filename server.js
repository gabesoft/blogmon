var express = require('express')
  , expose  = require('express-expose')
  , app     = module.exports = express()
  , port    = process.env.PORT || 3000
  , bundle  = require('browserify')
  , config  = require('./lib/app/config.js')
  , routes  = require('./lib/app/routes.js')
  , init    = require('./lib/app/initializer.js')
  , util    = require('util');

var bundle = bundle({
        entry   : __dirname + '/pub/app/app.js'
      , debug   : false
      , mount   : '/all.js'
      , filter  : process.env.NODE_ENV === 'production' ? require('uglify-js') : String
      , require : { jquery: 'br-jquery' }
    });

config(app, express);

init.initModules(app);

routes(app);

app.modules.agg.run();

app.listen(port, function() {
    console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});

app.use(bundle);

process.on('uncaughtException', function(err) {
    util.log('uncaught exception');
    util.error(err);
    util.error(err.stack);
});

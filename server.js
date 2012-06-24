var express = require('express')
  , app     = module.exports = express.createServer()
  , port    = process.env.PORT || 3000
  , bundle  = require('browserify')
  , config  = require('./lib/app/config.js')
  , routes  = require('./lib/app/routes.js')
  , init    = require('./lib/app/initializer.js');

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
    console.log("Express server listening on port %d in %s mode", 
        app.address().port, app.settings.env);
});

app.use(bundle);

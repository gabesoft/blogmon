var url   = require('url')
  , util  = require('../util.js')
  , redis = require('redis')
  , conn  = process.env.REDISTOGO_URL || process.env.DB_URL

  , parseRedisUrl = function() {
        if (util.nil(conn)) { return null; }

        var uri  = url.parse(conn)
          , auth = (uri.auth || '').split(':');
        return {
            host : uri.hostname,
            port : uri.port,
            db   : auth[0],
            pass : auth[1]
        }; 
    }

  , config = parseRedisUrl();

module.exports = {
    client: function(db) {
        var client;

        if (util.nil(config)) {
            client = redis.createClient();
        } else {
            client = redis.createClient(config.port, config.host);
            client.auth(config.pass);
        }

        client.select(db, function(err, res) {
            console.log('redis database: ' + db, res, err);
        });
        client.on('error', function(err) {
            console.error(err.message);
        });

        return client;
    },

    store: function(express) {
        var Store = require('connect-redis')(express);
        return new Store(config);
    }
};

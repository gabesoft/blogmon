var url   = require('url'),
    URL   = process.env.REDISTOGO_URL,
    util  = require('../util.js'),
    redis = require('redis');

var parseRedisUrl = function() {
    if (util.check.nil(URL)) { return null; }
    var uri = url.parse(URL),
        auth = uri.auth.split(':');
    return {
        host: uri.hostname,
        port: uri.port,
        db  : auth[0],
        pass: auth[1]
    }; 
};

var config = parseRedisUrl();

module.exports = {
    client: function(db) {
        var client;

        if (util.check.nil(config)) {
            client = redis.createClient();
        } else {
            client = redis.createClient(config.port, config.host);
            client.auth(config.pass);
        }

        client.select(db, function(err, res) {
            console.log('redis database: ' + db, res, err);
        });
        client.on('error', function(err) {
            console.log(err);
        });

        return client;
    },

    store: function(express) {
        var Store = require('connect-redis')(express);
        return new Store(config);
    }
};

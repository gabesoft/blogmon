var TEST_DB = 2,
    redis = require('redis');

module.exports.client = function() {
    var client = redis.createClient();
    client.select(TEST_DB);
    client.debug_mode = true;
    client.on('error', function(err) { console.log(err); });
    return client;
};

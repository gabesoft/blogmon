module.exports = function(app) {
    var db = app.set('redisdb'),
        redis  = require('./redis_helper.js').client(db);

    require('./routes_auth.js')(app, redis);
    require('./routes_main.js')(app, redis);
};

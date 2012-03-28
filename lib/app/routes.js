module.exports = function(app, redis, agg) {
    require('./routes_auth.js')(app, redis);
    require('./routes_main.js')(app, redis, agg);
};

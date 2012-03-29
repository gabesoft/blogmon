module.exports = function(app) {
    require('./routes_auth.js')(app);
    require('./routes_main.js')(app);
};

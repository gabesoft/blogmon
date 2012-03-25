module.exports = function(app) {
    var redis  = require('./redis_helper.js')().client(),
        expose = require('express-expose');

    /*
     * renders the login page
     */
    app.get('/session/new', function(req, res) {
      // TODO: display the login page
    });

    /*
     * authenticates credentials and starts a new session (login)
     */
    app.post('/session', function(req, res) {
      // TODO: update the current session (login)
    });

    /*
     * ends the current session (logout)
     */
    app.del('/session', function(req, res) {
      // TODO: remove current session (logout)
    });

    /*
     * renders the signup page
     */
    app.get('/users/new', function(req, res) {
      // TODO: render the signup page
    });

    /*
     * creates a new user and logs her in
     */
    app.post('/users', function(req, res) {
      // TODO: create a new user and log him in
    });
};

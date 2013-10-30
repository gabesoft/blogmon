module.exports = function(app) {
    var auth  = require('./auth.js')(app.modules.redis)
      , util  = require('../util.js')
      , users = app.modules.users
      , eyes  = require('eyes')
      , renderSignup = function(req, res) {
            res.render('signup', {
                title: 'Blog Monitor'
              , titleInfo: 'Create Account'
              , locals: { user: req.body.user || {} }
            });
        }
      , renderLogin = function(req, res) {
            res.render('login', {
                title: 'Blog Monitor'
              , titleInfo: 'Login'
              , locals: { user: req.body.user || {} }
            });
        };

    /*
     * renders the login page
     */
    app.get('/session/new', renderLogin);

    /*
     * renders the signup page
     */
    app.get('/users/new', renderSignup);

    /*
     * authenticates credentials and starts a new session (login)
     */
    app.post('/session', function(req, res) {
        var succ = function() { res.redirect('/'); },
            fail = function() {
                req.flash('error', 'login failed');
                renderLogin(req, res);
            };
        auth.login(req, res, succ, fail);
    });

    /*
     * ends the current session (logout)
     */
    app.del('/session', function(req, res) {
        auth.logout(req, res, function() {
            res.redirect('/session/new');
        });
    });

    /*
     * creates a new user and logs her in
     */
    app.post('/users', function(req, res) {
        var user = req.body.user;
        if (user.name === '') {
            req.flash('warn', 'The user name cannot be blank');
            renderSignup(req, res);
        } else if (user.pass === '') {
            req.flash('warn', 'Blank passwords are not allowed');
            renderSignup(req, res);
        } else if (user.pass !== user.pass2) {
            req.flash('warn', 'Passwords don\'t match');
            renderSignup(req, res);
        } else {
            users.create(user.name, user.pass, function(err, user) {
                if (util.exists(err)) {
                    req.flash('error', err.message);
                    renderSignup(req, res);
                } else {
                    auth.init(req, res, user, function() {
                        res.redirect('/');
                    });
                }
            });
        }
    });
};

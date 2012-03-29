module.exports = function(app) {
    var auth   = require('./auth.js')(app.modules.redis),
        util   = require('../util.js'),
        users  = app.modules.users;

    /*
     * renders the login page
     */
    app.get('/session/new', function(req, res) {
        res.render('login', {
            title: 'Blog Monitor',
            titleInfo: 'Login',
            layout: 'layouts/login'
        });
    });

    /*
     * renders the signup page
     */
    app.get('/users/new', function(req, res) {
        res.render('signup', {
            title: 'Blog Monitor',
            titleInfo: 'Create Account',
            layout: 'layouts/login'
        });
    });

    /*
     * authenticates credentials and starts a new session (login)
     */
    app.post('/session', function(req, res) {
        var succ = function() { res.redirect('/'); }; 
        var fail = function() {
            req.flash('warn', 'login failed');
            res.redirect('/session/new');
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
        var cred = req.body.user;
        if (cred.name === '') {
            req.flash('warn', 'The user name cannot be blank');
            res.redirect('/users/new');
        } else if (cred.pass === '') {
            req.flash('warn', 'Blank passwords are not allowed');
            res.redirect('/users/new');
        } else if (cred.pass !== cred.pass2) {
            req.flash('warn', 'Passwords don\'t match');
            res.redirect('/users/new');
        } else {
            users.create(cred.name, cred.pass, function(err, user) {
                if (util.exists(err)) {
                    req.flash('error', err.message);
                    res.redirect('/users/new');
                } else {
                    auth.init(req, res, user, function() {
                        res.redirect('/');
                    });
                }
            });
        }
    });
};


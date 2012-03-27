var NAMES  = 'user:name',
    util   = require('../util.js'),
    crypto = require('crypto');

function User (redis) {
    if (!(this instanceof User)) { return new User(redis); }
    this.redis = redis;
}

module.exports = User;

var getKey  = function(name) { 
    return 'user:name:' + name;
};

var getsalt = function() {
    return Math.round(new Date().valueOf() * Math.random()) + '';
};

var encrypt = function(text, salt) {
    return crypto
       .createHmac('sha1', salt)
       .update(text)
       .digest('hex');
};

User.prototype.authenticate = function(name, pass, callback) {
    this.get(name, function(err, user) {
        var encrypted;

        if (util.nil(user)) {
            callback(err, user);
        } else {
            encrypted = encrypt(pass, user.salt);
            callback(err, user.pass === encrypted ? user : null);
        }
    });
};

User.prototype.create = function(name, pass, callback) {
    var key   = getKey(name),
        redis = this.redis,
        salt  = getsalt(),
        user;

    redis.sadd(NAMES, name, function(nerr, added) {
        if (added === 0) {
            callback(new Error('A user with name ' + name + ' already exists'), null);
        } else {
            user = {
                name: name,
                salt: salt,
                pass: encrypt(pass, salt)
            };
            redis.set(key, JSON.stringify(user), function(serr, res) {
                callback(serr, user);
            });
        }
    });
};

User.prototype.get = function(name, callback) {
    var key = getKey(name), redis = this.redis, user; 
    redis.get(key, function(err, data) {
        if (util.nil(data)) {
            callback(null, null);
        } else {
            callback(err, JSON.parse(data));
        }
    });
};

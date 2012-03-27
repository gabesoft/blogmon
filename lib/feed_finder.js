/*
 * Feed finder.
 */

var util    = require('./util.js'),
    request = require('request');

function Finder () {
    if (!(this instanceof Finder)) { return new Finder(); }
}

module.exports = Finder;

var getUrl = function(link) {

    var query = encodeURIComponent(link);
    return 'http://www.google.com/reader/api/0/feed-finder?output=json&q=' + query;
};

Finder.prototype.find = function(link, callback) {
    var apiUrl = getUrl(link);
    request(apiUrl, function(req, res, body) {
        var data = JSON.parse(body);
        if (util.exists(data.items) && data.items.length > 0) {
            callback(data.items[0].feed[0].href);
        } else if (util.exists(data.feed) && util.exists(data.feed[0].href)) {
            callback(data.feed[0].href);
        } else {
            callback(null);
        }
    });
};

/*
 * Feed finder.
 */

var util    = require('./util.js')
  , eyes    = require('eyes')
  , request = require('request');

function Finder () {
    if (!(this instanceof Finder)) { return new Finder(); }
}

module.exports = Finder;

var getUrl = function(link) {
        var query = encodeURIComponent(link);
        return 'http://www.google.com/reader/api/0/feed-finder?output=json&q=' + query;
    }
  , getTitle = function(data) {
        var title = data.title
          , uri   = data.feed[0].href;
        return util.str.startsWith(title, 'Feed results for') ? uri : title;
    }
  , getDesc = function(data) {
        return data.content ? data.content.content : '';
    }
  , getFeed = function(data) {
        return {
            id: data.id
          , uri: data.feed[0].href
          , title: getTitle(data)
          , description: getDesc(data)
        };
    };

Finder.prototype.find = function(link, callback) {
    var apiUrl = getUrl(link);
    request(apiUrl, function(req, res, body) {
        var data = JSON.parse(body);

        if (util.exists(data.items) && data.items.length > 0) {
            callback(data.items.map(getFeed));
        } else if (util.exists(data.feed) && util.exists(data.feed[0].href)) {
            callback([getFeed(data)]);
        } else {
            callback([]);
        }
    });
};

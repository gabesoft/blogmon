/*
 * Feed finder.
 */

var util    = require('./util.js')
  , eyes    = require('eyes')
  , request = require('request');

function Finder (options) {
    if (!(this instanceof Finder)) { return new Finder(options); }
    this.referer = options.referer;
    this.userIp  = options.userIp;
}

module.exports = Finder;

var getOptions = function(finder, link) {
        return {
            url     : 'https://ajax.googleapis.com/ajax/services/feed/find'
          , qs      : { v: '1.0', q: link, userip: finder.userIp }
          , headers : { HTTP_REFERER: finder.referer }
        };
    }
  , stripHtml = function (text) {
        return (text || '').replace(/<(?:.|\n)*?>/gm, '');
    }
  , getFeed = function(data) {
        return {
            id          : data.id
          , title       : stripHtml(data.title)
          , uri         : data.url
          , link        : data.link
          , description : stripHtml(data.contentSnippet)
        };
    };

Finder.prototype.find = function(link, callback) {
    var opts = getOptions(this, link);
    request(opts, function(req, res, body) {
        var data    = JSON.parse(body)
          , entries = null;

        if (data && data.responseData) {
            entries = data.responseData.entries;
        }

        if (util.exists(entries) && entries.length > 0) {
            callback(entries.map(getFeed));
        } else if (util.exists(data.feed) && util.exists(data.feed[0].href)) {
            callback([getFeed(data)]);
        } else {
            callback([]);
        }
    });
};

/*
 * Feed and post builder.
 */

var util    = require('./util.js')
  , eyes    = require('eyes')
  , url     = require('url')
  , getLink = function(uri) {
        var parsed   = url.parse(uri)
          , relative = util.nil(parsed.host);
        return relative ? util.str.sprintf('http://%s', uri) : uri;
    };

function Builder() {
    if (!(this instanceof Builder)) { return new Builder(); }
}

module.exports = Builder;

Builder.prototype.post = function(post, feed) {
    return {
        feedUri     : feed.uri
      , feedTitle   : feed.title || feed.link
      , feedLink    : feed.link
      , title       : post.title || 'Untitled'
      , description : null
      , link        : getLink(post.link)
      , date        : post.date || new Date()
      , pubdate     : post.pubdate
      , author      : post.author
      , guid        : post.guid
      , image       : post.image
    };
};

Builder.prototype.feed = function(uri, meta, data, old) {
    return {
        uri         : uri
      , title       : meta.title || old.title || uri
      , description : meta.description
      , link        : getLink(meta.link || uri)
      , author      : meta.author
      , language    : meta.language
      , image       : meta.image
      , date        : meta.date
      , data        : data
    };
};

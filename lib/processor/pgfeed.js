/*
 * Processor for getting the content for paul graham's blogs.
 */

var util         = require('../util.js')
  , $            = require('br-jquery').jquery()
  , eyes         = require('eyes')
  , request      = require('request')
  , data         = require('./pgfeed_data.js')
  , dates        = data.dates
  , links        = data.links
  , jsdom        = require('jsdom')
  , jsdomOptions = {
        FetchExternalResources: false
      , ProcessExternalResources: false
      , MutationEvents: false
      , QuerySelector: false
    }
  , getHtml = function(uri, callback) {
        request(uri, function(req, res, body) {
            callback(body);
        });
    }
  , extractContent = function(doc, link) {
        var els = doc.find('p:first');
        if (els.length === 1) {
            return els[0];
        } 

        els = doc.find('font[size=2]:first');
        if (els.length === 1) {
            return els[0];
        }

        console.error('extract content error ' + link);
        return doc.find('body');
    };

function PGFeed () {
    if (!(this instanceof PGFeed)) { return new PGFeed(); }
}

module.exports = PGFeed;

PGFeed.prototype.process = function(post) {
    post.date = dates[post.guid] || new Date();
    post.link = links[post.link] || post.link;
};

PGFeed.prototype.appliesTo = function(feedUrl) {
    return feedUrl === 'http://www.aaronsw.com/2002/feeds/pgessays.rss';
};

PGFeed.prototype.getDescription = function(post, defdesc, callback) {
    getHtml(post.link, function(html) {
        jsdom.env({
            features: jsdomOptions
          , html: html
          , done: function(err, window) {
                if (util.nil(err)) {
                    var doc     = $(window.document)
                      , content = extractContent(doc, post.link)
                      , result  = content.innerHTML
                            ? util.str.sprintf('<html><body>%s</body></html>', content.innerHTML)
                            : window.document.body.innerHTML;
                        callback(result);
                } else {
                    console.error(err.message);
                    callback(defdesc);
                }
            }
        });
    });
};

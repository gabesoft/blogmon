/*
 * Processor for getting the content for paul graham's blogs.
 */

var util         = require('../util.js')
  , $            = require('br-jquery').jquery()
  , eyes         = require('eyes')
  , request      = require('request')
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
  , getDate = function(doc) {
        // TODO: implement
        return new Date();
    };

function PGFeed () {
    if (!(this instanceof PGFeed)) { return new PGFeed(); }
}

module.exports = PGFeed;

PGFeed.prototype.process = function(post, callback) {
    getHtml(post.link, function(html) {
        jsdom.env({
            features: jsdomOptions
          , html: html
          , done: function(err, window) {
                if (util.nil(err)) {
                    var doc = $(window.document);

                    post.date        = getDate(doc);
                    post.description = window.document.body.innerHTML;
                }
                callback(post);
            }
        });
    });
};

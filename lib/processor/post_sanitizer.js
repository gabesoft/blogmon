/*
 * Post entry processor for cleaning and tidying up the post descripion.
 */
var util         = require('../util.js')
  , $            = require('br-jquery').jquery()
  , eyes         = require('eyes')
  , jsdom        = require('jsdom')
  , url          = require('url')
  , jsdomOptions = {
        FetchExternalResources: false
      , ProcessExternalResources: false
      , MutationEvents: false
      , QuerySelector: false
    }

  , relative = function(uri) {
        var parsed = url.parse(uri);
        return util.nil(parsed.host);
    }

  , removeIframes = function(doc) {
        doc.find('iframe').remove();
    } 

  , removeStylesheets = function(doc) {
        doc.find('link[rel=stylesheet]').remove();
        doc.find('style').remove();
    }

  , removeEmptyLinks = function(doc) {
        doc.find('a')
           .filter(function() {
                return util.str.trim($(this).html()).length === 0;
            })
           .remove();
    }

  , removeShareLinks = function(doc) {
        doc.find('div.feedflare').remove();
    }

  , cleanImages = function(doc) {
        doc.find('img')
           .filter(function() {
                return relative($(this).attr('src'));
            })
           .remove();
    }

  , disableRelativeUrls = function(doc) {
        doc.find('a').each(function() {
            var link = $(this)
              , href = link.attr('href')
              , uri = relative(href) ? '' : href;
            link.attr('href', uri);
        });
    }

  , removeScriptTags = function(doc) {
        doc.find('script').remove();
    };

function PostSanitizer () {
    if (!(this instanceof PostSanitizer)) { return new PostSanitizer(); }
}

module.exports = PostSanitizer;

PostSanitizer.prototype.clean = function(html, callback, message) {
    jsdom.env({
        features: jsdomOptions
      , html: html
      , done: function(err, window) {
            if (util.exists(err)) {
                console.error(message || '', err.message);
                if (util.exists(window)) {
                    eyes.inspect($(window.document));
                }
                callback(html);
            } else {
                var doc = $(window.document);

                removeIframes(doc);
                removeScriptTags(doc);
                removeStylesheets(doc);
                cleanImages(doc);
                disableRelativeUrls(doc);
                removeShareLinks(doc);
                removeEmptyLinks(doc);

                if (util.exists(window.document.body)) {
                    callback(window.document.body.innerHTML);
                } else {
                    callback(window.document.innerHTML);
                }
            }
        }
    });
};

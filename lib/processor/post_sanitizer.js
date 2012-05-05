/*
 * Post entry processor for cleaning and tidying up the post descripion.
 */
var util  = require('../util.js')
  , $     = require('br-jquery').jquery()
  , eyes  = require('eyes')
  , jsdom = require('jsdom')
  , url   = require('url')

  , relative = function(uri) {
        var parsed = url.parse(uri);
        return util.nil(parsed.host);
    }

  , removeScriptTags = function(doc) {

    }

  , removeStylesheets = function(doc) {

    }

  , removeTrackImages = function(doc) {

    }

  , removeShareLinks = function(doc) {

    }

  , disableRelativeUrls = function(doc) {
        doc.find('img').each(function() {
            var img = $(this)
              , src = img.attr('src')
              , uri = relative(src) ? '' : src;
            img.attr('src', uri);
        });
        doc.find('a').each(function() {
            var link = $(this)
              , href = link.attr('href')
              , uri = relative(href) ? '' : href;
            link.attr('href', uri);
        });
    }

  , hasVisibleText = function(doc) {
        return true;
    }

  , removeScriptTags = function(doc) {
        doc.find('script').remove();
    };

function PostSanitizer () {
    if (!(this instanceof PostSanitizer)) { return new PostSanitizer(); }
}

module.exports = PostSanitizer;

PostSanitizer.prototype.clean = function(html, callback) {
    var features = {
            FetchExternalResources: false //['script', 'img', 'css', 'frame', 'link']
          , ProcessExternalResources: false
          , MutationEvents: false
          , QuerySelector: false
        };
    jsdom.env({
        features: features
      , html: html
      , done: function(err, window) {
            var doc = $(window.document);

            removeScriptTags(doc);
            removeStylesheets(doc);
            disableRelativeUrls(doc);
            removeTrackImages(doc);
            removeShareLinks(doc);

            //eyes.inspect(window.document.innerHTML);

            if (hasVisibleText(doc)) {
                callback(window.document.body.innerHTML);
            } else {
                callback(null);
            }

        }
    });
};

PostSanitizer.prototype.process = function(post, callback) {
    this.clean(post.description, function(clean) {
        post.description = clean;
        callback(post);
    });
};

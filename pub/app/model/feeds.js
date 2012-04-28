var backbone = require('../dep/backbone.js')
  , feed     = require('./feed.js');

module.exports = backbone.Collection.extend({
    model: feed
  , url: '/feeds'
  , comparator: function(feed) {
        var title = feed.get('title')
          , text  = title ? title.toLowerCase() : '';
        return text;
    }
});

var Backbone = require('../dep/backbone.js')
  , Feed     = require('./feed.js');

module.exports = Backbone.Collection.extend({
    model: Feed
  , url: '/feeds'
});

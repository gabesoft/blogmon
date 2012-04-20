var backbone = require('../dep/backbone.js')
  , feed     = require('./feed.js');

module.exports = backbone.Collection.extend({
    model: feed,
    url: '/feeds'
});

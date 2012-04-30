var backbone = require('../dep/backbone.js')
  , item     = require('./search_item.js');

module.exports = backbone.Collection.extend({
    model: item
});


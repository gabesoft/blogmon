var backbone = require('../dep/backbone.js')
  , item     = require('./searchitem.js');

module.exports = backbone.Collection.extend({
    model: item
});


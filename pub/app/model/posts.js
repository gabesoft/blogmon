var backbone = require('../dep/backbone.js')
  , post     = require('./post.js');

module.exports = backbone.Collection.extend({
    model: post,
    url: '/posts'
});

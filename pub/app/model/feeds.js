(function() {
    var Backbone = require('../dep/backbone.js');
    var Feeds = Backbone.Collection.extend({
        url: '/feeds'
    });
    model.exports = Feeds;
}).call(this);

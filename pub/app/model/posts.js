(function() {
    var Backbone = require('../dep/backbone.js');
    var Posts = Backbone.Collection.extend({
        url: '/posts'
    });
    model.exports = Posts;
}).call(this);


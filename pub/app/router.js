var $ = require('jquery'),
    Backbone = require('./dep/backbone.js');

var Router = Backbone.Router.extend({
    routes: {
        ""     : "showPosts"
      , "posts" : "showPosts"
      , "feeds" : "showFeeds"
    },

    showPosts: function() {
        console.log('posts', arguments);
        $('.tab-content').hide();
        $('#posts-content').show();
    },

    showFeeds: function() {
        console.log('feeds', arguments);
        $('.tab-content').hide();
        $('#feeds-content').show();
    }
});

module.exports = Router;

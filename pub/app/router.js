var $ = require('jquery'),
    Backbone = require('./dep/backbone.js'),
    FeedsTab = require('./view/feedstab.js');

module.exports = Backbone.Router.extend({
    routes: {
        ""      : "showPosts"
      , "posts" : "showPosts"
      , "feeds" : "showFeeds"
    },

    initialize: function(opts) {
        this.tabElems = $('.tab-content');
        this.feedsTab = new FeedsTab({
            el: $('#feeds-content')
        });
    },

    showPosts: function() {
        $('.tab-content').hide();
        $('#posts-content').show();
    },

    showFeeds: function() {
        this.tabElems.hide();
        this.feedsTab.render();
    }
});

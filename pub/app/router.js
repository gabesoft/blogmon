var $ = require('jquery')
  , Backbone = require('./dep/backbone.js')
  , PostsTab = require('./view/poststab.js')
  , FeedsTab = require('./view/feedstab.js');

module.exports = Backbone.Router.extend({
    routes: {
        ""      : "showPosts"
      , "posts" : "showPosts"
      , "feeds" : "showFeeds"
    },

    initialize: function(opts) {
        this.tabElems = $('.tab-content');
        this.tabs     = $('.tab');
        this.feedsTab = new FeedsTab({
            el: $('#feeds-content')
        });
        this.postsTab = new PostsTab({
            el: $('#posts-content')
        });
    },

    showPosts: function() {
        this.tabElems.hide();
        this.activateTab('#posts-tab');
        this.postsTab.render();
    },

    showFeeds: function() {
        this.tabElems.hide();
        this.activateTab('#feeds-tab');
        this.feedsTab.render();
    },

    activateTab: function(tab) {
        this.tabs.removeClass('active');
        $(tab).addClass('active');
    }
});

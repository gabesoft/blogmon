var $ = require('jquery')
  , Backbone = require('./dep/backbone.js')
  , PostsTab = require('./view/posts_tab.js')
  , FeedsTab = require('./view/feeds_tab.js');

module.exports = Backbone.Router.extend({

    routes: {
        ""            : "showPosts"
      , "posts/*path" : "showPosts"
      , "feeds"       : "showFeeds"
    },

    // TODO: the tab views should have hide/show methods

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
        if (arguments.length === 0) {
            this.postsTab.reload();
        }
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

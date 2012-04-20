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
        this.feedsTab = new FeedsTab({
            el: $('#feeds-content')
        });
        this.postsTab = new PostsTab({
            el: $('#posts-content')
        });
    },

    showPosts: function() {
        this.tabElems.hide();
        this.postsTab.render();
    },

    showFeeds: function() {
        this.tabElems.hide();
        this.feedsTab.render();
    }
});

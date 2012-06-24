var backbone    = require('../dep/backbone.js')
  , $           = require('jquery')
  , _           = require('../dep/underscore.js')
  , ScrollState = require('./scroll_state.js')
  , Loader      = require('./loader.js')
  , Posts       = require('../model/posts.js')
  , PostView    = require('./post.js');

module.exports = backbone.View.extend({
    initialize: function(config) {
        var me = this;

        _.bindAll(me
          , 'append'
          , 'onLoad'
          , 'onLoadComplete'
          , 'loadMore');

        me.model  = new Posts();

        me.scroll = new ScrollState({ 
            el    : '#posts-list'
          , offset: 200 
        });
        me.scroll.bind('bottom-scroll-up', me.loadMore);

        me.loader = new Loader({
            pageSize  : 20
          , loader    : '#loader'
          , collection: me.model
        });
        me.loader.on('load', me.onLoad);
        me.loader.on('load-complete', me.onLoadComplete);
        me.loader.load(true);
    },

    reload: function() {
        this.$el.find('#posts-list').empty();
        this.loader.load(true);
    },

    onLoadComplete: function(model, loadedCount) {
        var el   = this.$el.find('#empty')
          , text = loadedCount > 0 
                ? '' 
                : 'Your blog list is empty. <a href="#feeds">Subscribe</a> to some feeds to get started.';
        el.html(text);
    },

    onLoad: function(model, list) {
        this.model.each(this.append);
    },

    loadMore: function() {
        this.loader.load();
    },

    render: function() {
        this.$el.show();
    },

    append: function(item) {
        var feed = new PostView({ model: item })
          , list = this.$el.find('#posts-list');
        list.append(feed.render().el);
    }
});


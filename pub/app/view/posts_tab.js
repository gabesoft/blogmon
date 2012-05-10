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

        _.bindAll(me, 'append', 'onLoad', 'loadMore');

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
        me.loader.load(true);
    },

    onLoad: function() {
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
          , list = $('#posts-list');
        list.append(feed.render().el);
    }
});


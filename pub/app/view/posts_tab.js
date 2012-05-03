var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , Posts    = require('../model/posts.js')
  , PostView = require('./post.js');

module.exports = backbone.View.extend({
    events: {
        'scroll': 'loadMore'
    },

    initialize: function() {
        var me = this;

        _.bindAll(me, 'append', 'loadMore');

        $(window).bind('scroll', me.loadMore);

        me.limit = 20;
        me.start = 0;
        me.model = new Posts();
        me.model.bind('add', me.append);

        me.currScrollTop = 0;
        me.lastScrollTop = 0;

        me.loading = true;
        me.model.fetch({
            data: {
                start: me.start
              , limit: me.limit
            }
          , success: function(collection, response) { 
                if (response.length > 0) {
                    me.model.each(me.append);
                    me.start += me.limit;
                } else {
                    me.allLoaded = true;
                }
                me.loading = false;
                me.getLoaderEl().hide();
            }
          , error: function() {
                me.loading = false;
                me.getLoaderEl().hide();
            }
        });
        me.model.each(me.append);
    },

    scrollUp: function() {
        var val = false;
        this.currScrollTop = $(window).scrollTop();
        if (this.currScrollTop < this.lastScrollTop) {
            val = true;
        }
        this.lastScrollTop = this.currScrollTop;
        return val;
    },

    getLoaderEl: function() {
        return $('#loader');
    },

    loadMore: function() {
        // TODO: this should only run when the post list is visible
        //       the router should call postsTab.show(), postsTab.hide()
        if (this.loading) { 
            //console.log('loading', this.loading, this);
            return;
        }
        if (this.scrollUp()) {
            return;
        }
        if (this.allLoaded) {
            return;
        }

        var me        = this
          , top       = $(window).scrollTop()
          , docHeight = $(document).height()
          , winHeight = $(window).height()
          , offset    = 200;
        //, offset    = 300;

        if (top >= docHeight - winHeight - offset) {
            me.loading = true;
            me.getLoaderEl().show(); // TODO: make var
            me.model.fetch({
                data: {
                    start: me.start
                  , limit: me.limit
                }
              , success: function(collection, response) {
                    // TODO: the server should return no more results when the page limits are out of range
                    if (response.length > 0) {
                        me.model.each(me.append);
                        me.start += me.limit;
                    } else {
                        me.allLoaded = true;
                    }

                    me.loading = false;
                    me.getLoaderEl().hide();
                }
              , error: function() {
                    me.loading = false;
                    me.getLoaderEl().hide();
                }
            }, { add: true });
        }
    },

    render: function() {
        this.$el.show();
        return this;
    },

    append: function(item) {
        var feed = new PostView({ model: item })
          , list = $('#posts-list');
        list.append(feed.render().el);
    }
});


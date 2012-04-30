var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , Posts    = require('../model/posts.js')
  , PostView = require('./post.js');

module.exports = backbone.View.extend({
    initialize: function() {
        var me = this;

        _.bindAll(this, 'append');

        this.model = new Posts();
        this.model.bind('add', this.append);
        this.model.fetch({
            success: function() { 
                me.model.each(me.append);
            }
        });
        this.model.each(this.append);
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


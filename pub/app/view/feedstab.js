var Backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , Feeds    = require('../model/feeds.js')
  , FeedView = require('./feed.js');

module.exports = Backbone.View.extend({
    events: {
        "keypress #feeds-edit > input[type='text']": 'subscribeOnEnter'
      , "click #feeds-edit > input[type='button']" : 'subscribe'
    },

    initialize: function() {
        _.bindAll(this,
            'subscribeOnEnter',
            'subscribe',
            'render',
            'append');

        this.input = $("#feeds-edit > input[type='text']");
        this.model = new Feeds();
        this.model.bind('add', this.append);

        var me = this;
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
        var feed = new FeedView({ model: item })
          , list = $('#feeds-list');
        list.prepend(feed.render().el);
    },

    subscribeOnEnter: function(e, keyCode) {
        var key   = keyCode || e.keyCode,
            ENTER = 13;
        if (key === ENTER) {
            this.subscribe(e);
        }
    }, 

    subscribe: function(e) {
        console.log('subscribe', this.input.val());
        this.model.create({ uri: this.input.val() }, { wait: true });
        this.input.val('');
    }
});

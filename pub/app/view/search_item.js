var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .subscribe' : 'subscribe'
    },

    initialize: function(config) {
        this.template = mustache.compile($('#search-template').html());
        _.bindAll(this, 'subscribe');
    },

    subscribe: function(e) {
        var btn      = this.getSubscribeEl()
          , accepted = btn.hasClass('accepted');

        if (!accepted) {
            this.trigger('subscribe', this);
        }
    },

    getSubscribeEl: function() {
        return this.$el.find('.subscribe');
    },

    acceptSubscribe: function() {
        var btn  = this.getSubscribeEl()
          , icon = this.$el.find('.iconic');

        btn.text('Subscribed');
        btn.addClass('accepted');
        icon.addClass('accepted');
    },

    render: function() {
        var item = this.model.toJSON()
          , html = this.template(item);

        this.$el.html(html);
        if (item.subscribed) {
            this.acceptSubscribe();
        }
        return this;
    }
});

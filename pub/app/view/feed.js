var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .delete' : 'remove',
        'click .view'   : 'visibilityChange'
    },

    initialize: function(config) {
        this.template = mustache.compile($('#feed-template').html());
        _.bindAll(this
          , 'remove'
          , 'visibilityChange'
        );
    },

    render: function() {
        var feed = this.model.toJSON()
          , html = this.template(feed);

        this.$el.html(html);
        return this;
    },

    visibilityChange: function(e) {
        var visible = $(e.target).is(':checked');
        console.log('vchange', visible, this.model.get('link'));
    },

    remove: function(e) {
        var me = this;

        me.model.destroy({ wait: true });
        me.$el.fadeOut(function() {
            me.$el.remove();
        });
    }
});

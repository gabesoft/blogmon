var backbone   = require('../dep/backbone.js')
  , $          = require('jquery')
  , _          = require('../dep/underscore.js');

module.exports = backbone.View.extend({
    tagName: 'div',

    initialize: function(config) {
        _.bindAll(this, 'render', 'hide');
    },

    /*
     * Renders the message banner.
     * @msg      : the message to be displayed
     * @type     : info, warn, or error
     * @duration : the banner will be visible for this many miliseconds
     */
    render: function(msg, type, duration) {
        var me    = this
          , mode  = type || 'info'
          , delay = duration || 5000;

        if (!me.visible) { 
            console.log('show');
            me.visible = true;
            me.$el.text(msg);
            me.$el.addClass('active');
            me.$el.addClass(mode);
            me.$el.slideDown(800, function() {
                _.delay(me.hide, delay);
            });
        }
    },

    hide: function() {
        var me = this;
        if (me.visible) { 
            console.log('hide');
            me.$el.slideUp(800, function() {
                me.$el.removeClass('active');
                me.$el.text('');
                me.visible = false;
            });
        }
    }
});


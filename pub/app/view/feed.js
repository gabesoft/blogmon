var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

require('../dep/jquery.color.js');

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
          , 'render'
          , 'visibilityChange'
        );

        this.model.on('change', this.render);
    },

    render: function() {
        var feed     = this.model.toJSON()
          , hasError = !!feed.error
          , html     = null;

        feed.authorText  = feed.author ? '(' + feed.author + ')' : '';
        feed.description = hasError ? feed.error.message : feed.description;
        html             = this.template(feed);

        this.$el.html(html);

        if (hasError) {
            this.getDescriptionEl().addClass('error');
        }

        return this;
    },

    highlight: function() {
        var el = this.$el;
        el.parent().prepend(el);
        el.animate({
            backgroundColor: '#F0E68C'
        }, {
            duration: 3000
          , complete: function() {
                el.removeAttr('style');
            }
        });
    },

    getDescriptionEl: function() {
        return this.$el.find('.description');
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

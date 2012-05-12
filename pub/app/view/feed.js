var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , _s       = require('../dep/underscore.string.js')
  , mustache = require('../dep/mustache.js');

require('../dep/jquery.color.js');
require('../dep/jquery.viewport.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .delete'      : 'remove'
      , 'click .item-vis'    : 'toggleVisible'
    },

    initialize: function(config) {
        this.template = mustache.compile($('#feed-template').html());

        _.bindAll(this
          , 'remove'
          , 'render'
          , 'toggleVisible'
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

        if (feed.settings) {
            this.setVisible(feed.settings.visible, false);
        }

        if (hasError) {
            this.getDescriptionEl().addClass('error');
        }

        return this;
    },

    highlight: function() {
        var el     = this.$el
          , inview = $.inviewport(this.$el, { threshold: 0 });

        if (!inview) {
            el.parent().prepend(el);
        }

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

    setVisible: function(val, persist) {
        var el  = this.$el.find('.vis')
          , cls = 'unchecked';


        if (val) {
            el.removeClass(cls);
        } else {
            el.addClass(cls);
        }

        if (persist) {
            this.model.setVisible(val);
        }
    },

    getVisible: function() {
        return !this.$el
           .find('.vis')
           .hasClass('unchecked');
    },

    toggleVisible: function() {
        this.setVisible(!this.getVisible(), true);
    },

    remove: function(e) {
        var me         = this
          , model      = me.model
          , collection = model.collection;

        collection.remove(model);
        model.destroy({ wait: true });
        me.$el.fadeOut(function() {
            me.$el.remove();
        });
    }
});

var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

require('../dep/jquery.color.js');
require('../dep/jquery.viewport.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .delete'     : 'remove',
        'click .visibility' : 'visibilityChange'
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

    getVisibilityEl: function() {
        return this.$el.find('.visibility');
    },

    visibilityChange: function(e) {
        var el        = this.getVisibilityEl()
          , cls       = 'unchecked'
          , unchecked = el.hasClass(cls);
        if (unchecked) {
            el.removeClass(cls);
        } else {
            el.addClass(cls);
        }
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

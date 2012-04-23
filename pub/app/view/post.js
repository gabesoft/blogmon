var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .header' : 'toggleDescription'
    },

    initialize: function(config) {
        this.template = mustache.compile($('#post-template').html());
        _.bindAll(this, 'toggleDescription');
    },

    render: function() {
        var post = this.model.toJSON()
          , html = this.template(post);

        this.$el.html(html);
        return this;
    },

    toggleDescription: function() {
        var desc      = this.$el.find('.description')
          , cls       = 'collapsed'
          , collapsed = desc.hasClass(cls);

        if (collapsed) {
            desc.removeClass(cls);
        } else {
            desc.addClass(cls);
        }
    }
});


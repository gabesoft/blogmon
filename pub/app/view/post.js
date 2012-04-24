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
        var content   = this.$el.find('.post-content')
          , ccls      = 'collapsed'
          , ecls      = 'expanded'
          , collapsed = content.hasClass(ccls);

        if (collapsed) {
            content.removeClass(ccls);
            content.addClass(ecls);
        } else {
            content.removeClass(ecls);
            content.addClass(ccls);
        }
    }
});


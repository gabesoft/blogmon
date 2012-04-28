var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    initialize: function(config) {
        this.template = mustache.compile($('#search-template').html());
    },

    render: function() {
        var item = this.model.toJSON()
          , html = this.template(item);

        this.$el.html(html);
        return this;
    }
});

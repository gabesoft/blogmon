var Backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , mustache = require('../dep/mustache.js');

module.exports = Backbone.View.extend({
    tagName: 'li',

    initialize: function(config) {
        //console.log('init');
    },

    render: function() {
        var tmpl = $('#feed-template')
          , data = this.model.toJSON()
          , feed = data.feed || data
          , html = mustache.to_html(tmpl.html(), data);

          this.$el.html(html);
        return this;
    }
});

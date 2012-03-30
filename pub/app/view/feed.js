var Backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js');

module.exports = Backbone.View.extend({
    tagName: 'li',

    initialize: function(config) {
        //console.log('init');
    },

    render: function() {
        var data = this.model.toJSON();
        var feed = data.feed || data;
        this.$el.html(feed.title + ' - ' + feed.uri);
        return this;
    }
});

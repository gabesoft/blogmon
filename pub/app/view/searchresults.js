var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , Items    = require('../model/searchitems.js')
  , ItemView = require('./searchitem.js');

module.exports = backbone.View.extend({
    initialize: function(config) {
        _.bindAll(this
          , 'render'
          , 'append'
        );

        this.model = new Items(config.list);
        this.$el.empty();
        this.model.each(this.append);
    },

    render: function() {
        this.$el.show();
        return this;
    },

    append: function(item) {
        var view = new ItemView({ model: item })
          , list = this.$el;
        list.append(view.render().el);
    }
});

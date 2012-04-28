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
          , 'itemSubscribe'
        );

        this.model = new Items();
    },

    render: function(list) {
        this.model.each(function(item) {
            item.clear();
            item.off();
        });

        this.$el.empty();
        this.model.reset(list);
        this.model.each(this.append);
        this.$el.show();
        return this;
    },

    itemSubscribe: function(item) {
        item.acceptSubscribe();
        this.trigger('item-subscribe', item.model.toJSON());
    },

    append: function(item) {
        var view = new ItemView({ model: item })
          , list = this.$el;

        view.bind('subscribe', this.itemSubscribe);
        list.append(view.render().el);
    }
});

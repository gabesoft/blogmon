var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , _s       = require('../dep/underscore.string.js');

module.exports = backbone.Model.extend({
  encodedId: function() {
        return encodeURIComponent(this.get('id'));
    }

  , url: function(method) {
        switch(method) {
            case 'delete':
                return '/feeds/' + this.encodedId();
            case 'update':
                return '/feeds/' + this.encodedId();
            default: 
                return '/feeds';
        }
    }

  , sync: function(method, model, options) {
        options.url = _.isFunction(this.url) 
            ? this.url(method) 
            : this.url;
        return backbone.sync(method, model, options);
    }

  , setVisible: function(visible) {
        var settings = this.get('settings') || {}
          , id       = this.encodedId();

        settings.visible = visible;

        $.ajax({
            url : _s.sprintf('/feeds/%s/settings', id)
          , data: { value: settings }
          , type: 'POST'
        });
    }
});

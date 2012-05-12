var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , _s       = require('../dep/underscore.string.js');

module.exports = backbone.Model.extend({
    url: function(method) {
        switch(method) {
            case 'delete':
                return '/feeds/' + this.id;
            case 'update':
                return '/feeds/' + this.id;
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
        var settings = this.get('settings')
          , id       = this.get('id');

        settings.visible = visible;

        $.ajax({
            url : _s.sprintf('/feeds/%s/settings', id)
          , data: {
                settings: settings
            }
          , type: 'POST'
        });
    }
});

var backbone = require('../dep/backbone.js')
  , _        = require('../dep/underscore.js');

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
    },

    sync: function(method, model, options) {
        options.url = _.isFunction(this.url) 
            ? this.url(method) 
            : this.url;
        return backbone.sync(method, model, options);
    }
});

var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _s       = require('../dep/underscore.string.js');

module.exports = backbone.Model.extend({
    url: '/posts'

  , getDescription: function(done, always) {
        var me = this
          , id = encodeURIComponent(me.get('guid'));

        $.ajax({
            url: _s.sprintf('/posts/%s/description', id)
          , type: 'GET'
        }).done(function(desc) {
            me.set('description', desc);
            done();
        }).always(function() {
            always();
        });
    }

  , setFlag: function(flag) {
        var settings = this.get('settings') || {}
          , id       = encodeURIComponent(this.get('guid'));

        settings.flag = flag;

        $.ajax({
            url : _s.sprintf('/posts/%s/settings', id)
          , data: {
                settings: settings
            }
          , type: 'POST'
        });
    }
});

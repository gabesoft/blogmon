var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _s       = require('../dep/underscore.string.js');

module.exports = backbone.Model.extend({
    url: '/posts'

  , encodedId: function() {
        return encodeURIComponent(this.get('guid'));
    }

  , getDescription: function(done, always) {
        var me = this
          , id = me.encodedId();

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
          , id       = this.encodedId();

        settings.flag = flag;

        $.ajax({
            url : _s.sprintf('/posts/%s/settings', id)
          , data: { value: settings }
          , type: 'POST'
        });
    }

  , setRead: function() {
        $.ajax({
            url: _s.sprintf('/posts/%s/unread', this.encodedId())
          , data: { value: false }
          , type: 'POST'
        });
    }
});

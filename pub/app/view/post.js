var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , _s       = require('../dep/underscore.string.js')
  , datef    = require('../dep/date-format.js')
  , mustache = require('../dep/mustache.js');

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .header' : 'onHeaderClick'
    },

    initialize: function(config) {
        this.template = mustache.compile($('#post-template').html());
        _.bindAll(this, 'onHeaderClick');
    },

    render: function() {
        var post = this.model.toJSON()
          , html = null;

        post.dateStr = new Date(post.date).format('mm/dd/yyyy');
        html         = this.template(post);

        this.$el.html(html);
        this.$el.find('.flag').addClass(post.settings.flag);

        return this;
    },

    onHeaderClick: function(e) {
        var el = $(e.target);

        if (el.is('a') && el.hasClass('iconic')) {
            return;
        } else if (el.is('span') && el.hasClass('flag')) {
            this.updateFlag(el);
        } else {
            this.toggleDescription(el);
        }
    },

    updateFlag: function(el) {
        var red  = el.hasClass('red')
          , blue = el.hasClass('blue')
          , flag = 'none';

        if (red) {
            el.removeClass('red');
            el.addClass('blue');
            flag = 'blue';
        } else if (blue) {
            el.removeClass('blue');
            flag = 'none';
        } else {
            el.addClass('red');
            flag = 'red';
        }

        this.saveFlag(flag);
    },

    saveFlag: function(flag) {
        var data     = this.model.toJSON()
          , settings = data.settings
          , id       = encodeURIComponent(data.guid);

        settings.flag = flag;
        $.ajax({
            url: _s.sprintf('/posts/%s/settings', id)
          , data: {
                settings: settings
            }
          , type: 'POST'
        });
    },

    getContentEl: function() {
        return this.$el.find('.post-content');
    },

    getDescription: function(callback) {
        var me      = this
          , cls     = 'processing'
          , content = me.getContentEl()
          , id      = encodeURIComponent(me.model.get('guid'))
          , desc    = me.model.get('description');

        if (desc === null) {
            content.addClass(cls);
            $.ajax({
                url: _s.sprintf('/posts/%s/description', id)
              , type: 'GET'
            }).done(function(desc) {
                me.model.set('description', desc);
                me.render();
                callback();
            }).always(function() {
                content.removeClass(cls);
            });
        } else {
            callback();
        }
    },

    toggleDescription: function(el) {
        var me = this;

        this.getDescription(function() {
            var content   = me.getContentEl()
              , ccls      = 'collapsed'
              , ecls      = 'expanded'
              , collapsed = content.hasClass(ccls);

            if (collapsed) {
                content.removeClass(ccls);
                content.addClass(ecls);
            } else {
                content.removeClass(ecls);
                content.addClass(ccls);
            }
        });
    }
});


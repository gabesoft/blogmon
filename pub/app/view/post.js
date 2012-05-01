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

    toggleDescription: function(el) {
        var content   = this.$el.find('.post-content')
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
    }
});


var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , _s       = require('../dep/underscore.string.js')
  , datef    = require('../dep/date-format.js')
  , mustache = require('../dep/mustache.js')
  , flags    = [ 
        { color: 'none', next: 'red' }
      , { color: 'red',  next: 'blue' }
      , { color: 'blue', next: 'gray' }
      , { color: 'gray', next: 'none' }
    ];

module.exports = backbone.View.extend({
    tagName: 'li',

    events: {
        'click .header'     : 'onHeaderClick'
      , 'click .bottom-bar' : 'onFooterClick'
    },

    initialize: function(config) {
        this.template = mustache.compile($('#post-template').html());

        _.bindAll(this, 'onHeaderClick', 'onFooterClick', 'render');

        this.model.on('change', this.render);
    },

    anchor: function(guid, href) {
        return (href ? '#' : '') + 'posts/' + encodeURIComponent(guid);
    },

    render: function() {
        var post = this.model.toJSON()
          , html = null;

        post.anchorName = this.anchor(post.guid, false);
        post.anchorHref = this.anchor(post.guid, true);
        post.dateStr    = new Date(post.date).format('mm/dd/yyyy');
        html            = this.template(post);

        this.$el.html(html);
        this.$el.find('.flag').addClass(post.settings.flag);

        return this;
    },

    onHeaderClick: function(e) {
        var el = $(e.target);

        if (el.is('.flag')) {
            this.setFlag(el);
        } else if (el.is('.toggle-top') || el.is('.feed-title')) {
            this.toggleDescription(el);
        }
    },

    onFooterClick: function(e) {
        var el = $(e.target);

        if (el.is('.toggle-bottom')) {
            this.toggleDescription(el);
        }
    },

    setFlag: function(el) {
        var match = flags.filter(function(f) { 
                return el.hasClass(f.color);
            })
          , flag  = match.length === 1 ? match[0] : flags[0];

        el.removeClass(flag.color);
        el.addClass(flag.next);
        this.saveFlag(flag.next);
    },

    saveFlag: function(flag) {
        this.model.setFlag(flag);
    },

    getContentEl: function() {
        return this.$el.find('.post-content');
    },

    getDescription: function(callback) {
        var cls     = 'processing'
          , content = this.getContentEl()
          , desc    = this.model.get('description');

        if (desc === null) {
            content.addClass(cls);
            this.model.getDescription(callback, function() {
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
              , toggle    = me.$el.find('.toggle-top')
              , ccls      = 'collapsed'
              , ecls      = 'expanded'
              , collapsed = content.hasClass(ccls);

            if (collapsed) {
                content.removeClass(ccls);
                content.addClass(ecls);
                toggle.text('_');
            } else {
                content.removeClass(ecls);
                content.addClass(ccls);
                toggle.text('=');
            }
        });
    }
});


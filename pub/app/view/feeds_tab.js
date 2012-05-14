var backbone   = require('../dep/backbone.js')
  , $          = require('jquery')
  , _          = require('../dep/underscore.js')
  , _s         = require('../dep/underscore.string.js')
  , Feeds      = require('../model/feeds.js')
  , FeedView   = require('./feed.js')
  , SearchView = require('./search_results.js')
  , Message    = require('./message.js');

module.exports = backbone.View.extend({
    events: {
        'keypress #feeds-edit > input[type="text"]' : 'searchOnEnter'
      , 'click #feeds-edit .button.search'          : 'search'
      , 'click #search .button.close'               : 'hideSearch'
      , 'click .header-vis'                         : 'toggleVisibility'
      , 'click .item-vis'                           : 'updateVisibility'
    },

    initialize: function() {
        var me = this;

        _.bindAll(me
          , 'searchOnEnter'
          , 'subscribe'
          , 'subscribeFromSearch'
          , 'toggleVisibility'
          , 'updateVisibility'
          , 'updateHeader'
          , 'search'
          , 'hideSearch'
          , 'render'
          , 'append'
          , 'prepend'
        );

        me.input = me.$el.find('input.search');
        me.model = new Feeds();
        me.model.bind('add', me.prepend);
        me.model.bind('remove', me.updateHeader);
        me.model.fetch({
            success: function() { 
                me.model.each(me.append);
            }
        });

        me.model.each(me.append);
        me.searchView = new SearchView({ 
            el: this.getSearchEl().find('#search-list') 
        });
        me.searchView.bind('item-subscribe', this.subscribeFromSearch);
        me.message = new Message({ el: $('#message-banner') });
    },

    render: function() {
        this.getSearchEl().hide();
        this.getFeedsEl().show();
        this.$el.show();
        return this;
    },

    getFeedsEl: function() {
        return this.$el.find('#feeds-list');
    },

    getSearchEl: function() {
        return this.$el.find('#search');
    },

    getSubscribeEl: function() {
        return this.$el.find('.button.search');
    },

    addItem: function(item, addfn) {
        var feed  = new FeedView({ model: item, parent: this })
          , title = this.$el.find('li.list-header');
        item.view = feed;
        addfn(feed.render().el);
        this.updateVisibility();
        this.updateHeader();
    },

    prependEl: function(el) {
        this.$el.find('li.list-header').after(el);
    },

    appendEl: function(el) {
        this.getFeedsEl().append(el);
    },

    prepend: function(item) {
        this.addItem(item, _.bind(this.prependEl, this));
    },

    append: function(item) {
        this.addItem(item, _.bind(this.appendEl, this));
    },

    searchOnEnter: function(e, keyCode) {
        var key   = keyCode || e.keyCode
          , ENTER = 13;
        if (key === ENTER) {
            this.search(e);
        }
    }, 

    search: function(e) {
        if (this.input.val() === '') { return; }

        var me    = this
          , query = me.input.val()
          , done  = function(data) {
                _.each(data, function(r) {
                    r.subscribed = !!me.model.get(r.id);
                });
                if (data.length === 0) {
                    me.message.render('Could not find a blog matching your input', 'warn');
                } else if (data.length === 1) {
                    me.message.hide();
                    me.hideSearch();
                    me.subscribe(data[0]);
                } else {
                    me.message.hide();
                    me.showSearch(data);
                }
            }
          , always = function() {
                me.hideSearching();
            };

        me.showSearching();
        me.searchView.model.search(query, done, always);
    },

    showSearching: function() {
        this.getSubscribeEl()
           .addClass('processing')
           .text('Searching');
    },

    hideSearching: function() {
        this.getSubscribeEl()
           .removeClass('processing')
           .text('Subscribe');
    },

    showSearch: function(data) {
        var feedsEl    = this.getFeedsEl()
          , searchBtn  = this.getSubscribeEl()
          , searchEl   = this.getSearchEl()
          , searchView = this.searchView;

        searchView.render(data);
        feedsEl.hide();
        searchEl.show();
    },

    hideSearch: function() {
        this.getSearchEl().hide();
        this.getFeedsEl().show();
    },

    subscribeFromSearch: function(item) {
        this.subscribe(item);
    },

    highlight: function(id) {
        var feed = this.model.get(id);
        feed.view.highlight();
    },

    subscribe: function(data) {
        var me = this;

        if (data.subscribed) {
            me.highlight(data.id);
        } else {
            this.model.create({ 
                title       : data.title
              , description : data.description
              , link        : data.link
              , uri         : data.uri
              , data        : data
            }, { 
                wait: false
              , error: function(model, response, options) {
                    console.log(response.responseText);
                }
            });
        }
        this.input.val('');
    }, 

    toggleVisibility: function() {
        var el      = this.$el.find('.header-vis')
          , ucls    = 'unchecked'
          , pcls    = 'partial'
          , visible = !el.hasClass(ucls);

        el.removeClass(pcls);
        if (visible) {
            el.addClass(ucls);
        } else {
            el.removeClass(ucls);
        }

        this.model.each(function(m) {
            console.log(m.get('title'));
            m.view.setVisible(!visible, true);
        });
    },

    updateVisibility: function() {
        var el      = this.$el.find('.header-vis')
          , any     = this.$el.find('.item-vis.unchecked')
          , all     = this.$el.find('.item-vis')
          , on      = any.length === 0
          , off     = any.length === all.length
          , partial = !on && !off
          , pcls    = 'partial'
          , ucls    = 'unchecked';

        el.removeClass(pcls);
        el.removeClass(ucls);

        if (partial) {
            el.addClass(pcls);
        } else if (off) {
            el.addClass(ucls);
        }
    },

    updateHeader: function() {
        var header = this.$el.find('li.list-header h4.header')
          , text   = _s.sprintf('Feeds (%s)', this.model.length);
        header.text(text);
    }
});

var backbone   = require('../dep/backbone.js')
  , $          = require('jquery')
  , _          = require('../dep/underscore.js')
  , Feeds      = require('../model/feeds.js')
  , FeedView   = require('./feed.js')
  , SearchView = require('./search_results.js')
  , Message    = require('./message.js');

module.exports = backbone.View.extend({
    events: {
        "keypress #feeds-edit > input[type='text']" : 'searchOnEnter'
      , "click #feeds-edit .button.search"          : 'search'
      , "click #search .button.close"               : 'hideSearch'
    },

    initialize: function() {
        var me = this;

        _.bindAll(me
          , 'searchOnEnter'
          , 'subscribe'
          , 'subscribeFromSearch'
          , 'search'
          , 'hideSearch'
          , 'render'
          , 'append'
          , 'prepend'
        );

        me.input = me.$el.find('input.search');
        me.model = new Feeds();
        me.model.bind('add', me.prepend);
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

    addItem: function(item, addfn) {
        var feed = new FeedView({ model: item })
          , list = this.getFeedsEl();

        item.view = feed;
        list[addfn](feed.render().el);
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

    prepend: function(item) {
        this.addItem(item, 'prepend');
    },

    append: function(item) {
        this.addItem(item, 'append');
    },

    searchOnEnter: function(e, keyCode) {
        var key   = keyCode || e.keyCode
          , ENTER = 13;
        if (key === ENTER) {
            this.search(e);
        }
    }, 

    search: function(e) {
        var me = this;

        me.showSearching();
        $.ajax({
            url: '/feeds/search'
          , data: {
                searchText: this.input.val()
            }
          , type: 'GET'
        }).done(function(data, success, res) {
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
        }).fail(function() {
            console.log('search fail', arguments);
        }).always(function() {
            me.hideSearching();
        });
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

    subscribe: function(data) {
        var me = this;

        this.model.create({ 
            title       : data.title
          , description : data.description
          , link        : data.link
          , uri         : data.uri
          , data        : data
        }, { 
            wait: false
          , success: function(feed, data) {
                feed.view.render();
            }
          , error: function(model, response, options) {
                console.log(response.responseText);
            }
        });
        this.input.val('');
    }
});

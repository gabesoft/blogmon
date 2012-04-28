var backbone   = require('../dep/backbone.js')
  , $          = require('jquery')
  , _          = require('../dep/underscore.js')
  , Feeds      = require('../model/feeds.js')
  , FeedView   = require('./feed.js')
  , SearchView = require('./searchresults.js');

module.exports = backbone.View.extend({
    events: {
        "keypress #feeds-edit > input[type='text']" : 'searchOnEnter'
      , "click #feeds-edit .button.subscribe"       : 'search'
      , "click #search .button.close"               : 'closeSearch'
    },

    initialize: function() {
        var me = this;

        _.bindAll(me
          , 'searchOnEnter'
          , 'subscribe'
          , 'subscribeFromSearch'
          , 'search'
          , 'closeSearch'
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
    },

    render: function() {
        this.getSearchEl().hide();
        this.$el.show();
        return this;
    },

    addItem: function(item, addfn) {
        var feed = new FeedView({ model: item })
          , list = this.getFeedsEl();
        list[addfn](feed.render().el);
    },

    getFeedsEl: function() {
        return this.$el.find('#feeds-list');
    },

    getSearchEl: function() {
        return this.$el.find('#search');
    },

    getSubscribeEl: function() {
        return this.$el.find('.button.subscribe');
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

        $.ajax({
            url: '/feeds/search'
          , data: {
                searchText: this.input.val()
            }
          , method: 'GET'
        }).done(function(data, success, res) {
            if (data.length === 0) {
                // no results
            } else if (data.length === 1) {
                me.subscribe(data[0].uri);
            } else {
                me.showSearchResults(data);
            }
        }).fail(function() {
            console.log('search fail', arguments);
        });
    },

    showSearchResults: function(data) {
        var feedsEl    = this.getFeedsEl()
          , searchBtn  = this.getSubscribeEl()
          , searchEl   = this.getSearchEl()
          , searchView = this.searchView;

        searchView.render(data);
        feedsEl.hide();
        searchEl.show();
        searchBtn.text('Search');
    },

    closeSearch: function() {
        this.getSearchEl().hide();
        this.getFeedsEl().show();
        this.getSubscribeEl().text('Subscribe');
    },

    subscribeFromSearch: function(item) {
        this.subscribe(item.uri);
    },

    subscribe: function(uri) {
        this.model.create({ 
            uri: uri
        }, { 
            wait: true,
            error: function(model, response, options) {
                console.log(response.responseText);
            }
        });
        this.input.val('');
    }
});

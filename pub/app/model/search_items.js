var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , item     = require('./search_item.js');

module.exports = backbone.Collection.extend({
    model : item
  , search: function(query, done, always) {
        $.ajax({
            url: '/feeds/search'
          , data: { searchText: query }
          , type: 'GET'
        }).done(function(data, success, res) {
            done(data);
        }).fail(function() {
            console.log('search fail', arguments);
        }).always(function() {
            always();
        });
    }
});

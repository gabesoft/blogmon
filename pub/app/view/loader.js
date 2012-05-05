var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , loaderEl = function(obj) {
        return $(obj.loader);
    };

function Loader (config) {
    if (!(this instanceof Loader)) { return new Loader(config); }

    config = config || {};

    _.extend(this, backbone.Events);

    this.model  = config.collection;
    this.start  = 0;
    this.limit  = config.pageSize || 20;
    this.loader = config.loader;

    this.loading   = false;
    this.allLoaded = false;
}

module.exports = Loader;

/*
 * Loads a page of records.
 * @reset: true to load the first page and reset the collection 
 *         false to load the next page of records and append to
 *         the collection
 */
Loader.prototype.load = function(reset) {
    if (this.loading || this.allLoaded) { return; }

    var me     = this
      , loader = loaderEl(me);

    if (reset) {
        me.start = 0;
    }

    loader.show();
    me.loading = true;
    me.model.fetch({
        data: {
            start: me.start
          , limit: me.limit
        }
      , complete: function() {
            me.loading = false;
            loader.hide();
        }
      , success: function(collection, response) {
            if (response.length > 0) {
                me.start += me.limit;
                me.trigger('load', me.model, collection, response);
            } else {
                me.allLoaded = true;
            }
        }
      , error: function() {
            me.trigger('load-error', arguments);
        } 
    }, { 
        add: !reset 
    });
};

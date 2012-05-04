var backbone = require('../dep/backbone.js')
  , $        = require('jquery')
  , _        = require('../dep/underscore.js')
  , fire     = function(state, upEvt, downEvt) {
        if (state.direction() === 'up') {
            state.trigger(upEvt);
        }else {
            state.trigger(downEvt);
        }
    };

function ScrollState (config) {
    if (!(this instanceof ScrollState)) { return new ScrollState(config); }

    config = config || {};

    this.el     = config.el || 'body';
    this.offset = config.offset || 0;

    this.lastScrollTop = 0;

    _.extend(this, backbone.Events);
    _.bindAll(this, 'onScroll');

    $(window).bind('scroll', this.onScroll);
}

module.exports = ScrollState;

ScrollState.prototype.direction = function() {
    var top  = $(window).scrollTop()
      , last = this.lastScrollTop
      , dir  = top < last ? 'down' : 'up';

    this.lastScrollTop = top;

    return dir;
};

ScrollState.prototype.onScroll = function() {
    if ($(this.el).is(':visible')) {
        var top       = $(window).scrollTop()
          , offset    = this.offset
          , docHeight = $(document).height()
          , winHeight = $(window).height();

        fire(this, 'scroll-up', 'scroll-down');

        if (top >= docHeight - winHeight - offset) {
            fire(this, 'bottom-scroll-up', 'bottom-scroll-down');
        }
    }
};

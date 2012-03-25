(function(exports) {
    var $ = require('jquery');
    //var Backbone = require('backbone-browserify');
    var Backbone = require('./dep/backbone.js');
    var dateFormat = require('./dep/date-format.js');
    //var JSON = require('./dep/json2.js');

    console.log('jQuery', $);
    console.log('backbone', Backbone); // TODO: make br-backbone with latest version
    console.log('dateFormat', dateFormat);
    //console.log('JSON', JSON);

    $(document).ready(function() {
        console.log(JSON.stringify({ a: 1, b: 'two' }));
        console.log($('.container'));
        console.log((new Date()).format('ddd, mm/dd hh:MM:ss TT'));
        console.log(dateFormat(new Date(), 'ddd, mm/dd hh:MM:ss TT'));
    });
})(this);

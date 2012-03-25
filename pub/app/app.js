(function(exports) {
    var $ = require('jquery');
    var _ = require('./dep/underscore.js');
    var Backbone = require('./dep/backbone.js');
    var dateFormat = require('./dep/date-format.js');
    var tmpl = require('./dep/mustache.js');
    var JSON = require('./dep/json2.js');

    console.log('jQuery', $);
    console.log('backbone', Backbone);
    console.log('dateFormat', dateFormat);
    console.log('tmpl', tmpl);
    console.log('JSON', JSON);
    console.log('underscore', _);

    $(document).ready(function() {
        console.log(JSON.stringify({ a: 1, b: 'two' }));
        console.log($('.container'));
        console.log((new Date()).format('ddd, mm/dd hh:MM:ss TT'));
        console.log(dateFormat(new Date(), 'ddd, mm/dd hh:MM:ss TT'));
        _.each([1,2,3,4], function(x) { console.log('x', x); });
    });
})(this);

(function(exports) {
    var $ = require('jquery');
    var _ = require('./dep/underscore.js');
    var Backbone = require('./dep/backbone.js');
    var dateFormat = require('./dep/date-format.js');
    var tmpl = require('./dep/mustache.js');
    var JSON = require('./dep/json2.js');

    $(document).ready(function() {
        $('a.logout').on('click', function(e) {
            $.ajax('/session', {
                type: 'DELETE'
              , success: function(data, status, xhr) {
                    window.location = '/session/new';
                }
            });
        });
    });
})(this);

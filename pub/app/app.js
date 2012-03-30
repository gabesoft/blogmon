//var dateFormat = require('./dep/date-format.js');
//var tmpl = require('./dep/mustache.js');
//var JSON = require('./dep/json2.js');

var $ = require('jquery'),
    _ = require('./dep/underscore.js'),
    Backbone = require('./dep/backbone.js'),
    Router = require('./router.js');

$(document).ready(function() {
    var router = new Router();
    Backbone.history.start();

    $('#posts-tab').on('click', function() {
        router.navigate('posts', { trigger: true });
    });
    $('#feeds-tab').on('click', function() {
        router.navigate('feeds', { trigger: true });
    });
    $('a.logout').on('click', function(e) {
        $.ajax('/session', {
            type: 'DELETE'
          , success: function(data, status, xhr) {
                window.location = '/session/new';
            }
        });
    });
});

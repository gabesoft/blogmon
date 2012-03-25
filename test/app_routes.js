var should = require('should'),
    redis  = require('./redis_helper.js'),
    eyes   = require('eyes');

describe('routes', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    xit('should have a login route', function(done) {
      
    });
});

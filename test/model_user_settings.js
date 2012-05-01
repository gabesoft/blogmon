var should   = require('should')
  , util     = require('../lib/util.js')
  , eyes     = require('eyes')
  , redis    = require('./redis_helper.js').client()
  , postData = require('./support/data_post.js')
  , posts    = postData.posts
  , Settings = require('../lib/model/user_settings.js')
  , repo     = new Settings(redis, 'u1')
  , s1       = {
        visible: true
      , order  : 0
      , flag   : 'none'
      , state  : 'closed'
      , guid   : posts[0].guid
    }
  , s2      = {
        visible: true
      , order  : 1
      , flag   : 'blue'
      , state  : 'open'
      , guid   : posts[1].guid
    };

describe('user_settings', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    it('should set post settings', function(done) {
        repo.setPostSettings(s1.guid, s1, function(count) {
            count.should.eql(1);
            done();
        });
    });

    it('should update post settings', function(done) {
        repo.setPostSettings(s1.guid, s1, function(c1) {
            repo.setPostSettings(s1.guid, s2, function(c2) {
                repo.getPostSetting(s1.guid, function(settings) {
                    settings.should.eql(s2);
                    done();
                });
            });
        });
    });

    it('should get post settings', function(done) {
        repo.setPostSettings(s1.guid, s1, function() {
            repo.getPostSetting(s1.guid, function(settings) {
                should.exist(settings);
                settings.should.eql(s1);
                done();
            });
        });
    });

    it('should get all post settings', function(done) {
        repo.setPostSettings(s1.guid, s1, function() {
            repo.setPostSettings(s2.guid, s2, function() {
                repo.getAllPostSettings(function(settingsHash) {
                    settingsHash[s1.guid].should.eql(s1);
                    settingsHash[s2.guid].should.eql(s2);
                    done();
                });
            });
        });
    });
});

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
  , s2 = {
        visible: true
      , order  : 1
      , flag   : 'blue'
      , state  : 'open'
      , guid   : posts[1].guid
    }
  , d1 = {
        type  : 'post'
      , id    : s1.guid
      , value : s1
    }
  , d2 = {
        type  : 'post'
      , id    : s2.guid
      , value : s2
    }
  , u1 = {
        type  : 'post'
      , id    : s1.guid
      , value : true
      , name  : 'unread' 
    };

describe('user_settings', function() {
    beforeEach(function(done) {
        redis.flushdb(done);
    });

    it('should set post settings', function(done) {
        repo.set(d1, function(count) {
            count.should.eql([1]);
            done();
        });
    });

    it('should set post unread flag', function(done) {
        repo.set(u1, function(count) {
            count.should.eql([1]);
            done();
        });
    });

    it('should get post unread flag', function(done) {
        repo.set(u1, function() {
            repo.get('post', s1.guid, 'unread', function(res) {
                should.exist(res.unread);
                res.unread.should.equal(true);
                res.unread.should.be.a('boolean');
                done();
            });
        });
    });

    it('should update post settings', function(done) {
        var data = util.extend({}, d1);
        data.value = s2;

        repo.set(d1, function(c1) {
            repo.set(data, function(c2) {
                repo.get('post', s1.guid, function(res) {
                    res.settings.should.eql(s2);
                    done();
                });
            });
        });
    });

    it('should get post settings', function(done) {
        repo.set(d1, function() {
            repo.get('post', s1.guid, function(res) {
                should.exist(res.settings);
                res.settings.should.eql(s1);
                res.settings.visible.should.be.a('boolean');
                done();
            });
        });
    });

    it('should get all post settings', function(done) {
        repo.set(d1, function() {
            repo.set(u1, function() {
                repo.set(d2, function() {
                    repo.getAll('post', function(map) {
                        map[s1.guid].settings.should.eql(s1);
                        map[s1.guid].unread.should.equal(true);
                        map[s2.guid].settings.should.eql(s2);
                        should.not.exist(map[s2.guid].unread);
                        done();
                    });
                });
            });
        });
    });
});

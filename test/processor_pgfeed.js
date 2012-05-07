var should    = require('should')
  , fs        = require('fs')
  , path      = require('path')
  , eyes      = require('eyes')
  , util      = require('../lib/util.js')
  , Processor = require('../lib/processor/pgfeed.js')
  , proc      = new Processor()
  , data = [
        [ 'http://paulgraham.com/wealth.html', new Date('05/01/2004') ]
      , [ 'http://paulgraham.com/gh.html', new Date('07/01/2004') ]
      , [ 'http://paulgraham.com/essay.html', new Date('09/01/2004') ]
    ]
  , posts = data.map(function(u) { 
        return {
            link: u[0]
          , date: null
          , correctDate: u[1]
          , description: null
        };
    });

describe('pgfeed', function() {
    beforeEach(function() {
        posts.forEach(function(p) {
            p.date        = null;
            p.description = null;
        });
    });

    it('should set the correct date of a post', function(done) {
        util.cont(posts, done, function(post) {
            proc.process(post, function(res) {
                should.exist(res.date);
                res.date.should.eql(res.correctDate);
            });
        });
    });

    it('should set the description of a post', function(done) {
        proc.process(posts[0], function(res) {
            should.exist(res.description);
            done();
        });
    });
});

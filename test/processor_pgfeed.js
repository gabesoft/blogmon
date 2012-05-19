var should    = require('should')
  , fs        = require('fs')
  , path      = require('path')
  , eyes      = require('eyes')
  , util      = require('../lib/util.js')
  , Processor = require('../lib/processor/pgfeed.js')
  , proc      = new Processor()
  , data = [
        [ 'http://www.paulgraham.com/wealth.html', new Date('05/01/2004') ]
      , [ 'http://www.paulgraham.com/speak.html', new Date('03/01/2012') ]
      , [ 'http://www.paulgraham.com/gh.html', new Date('07/01/2004') ]
      , [ 'http://www.paulgraham.com/essay.html', new Date('09/01/2004') ]
    ]
  , posts = data.map(function(u) { 
        return {
            link: u[0]
          , guid: u[0]
          , date: null
          , correctDate: u[1]
          , description: null
        };
    });

describe('SLOW - pgfeed', function() {
    beforeEach(function() {
        posts.forEach(function(p) {
            p.date        = null;
            p.description = null;
        });
    });

    it('should set the correct date of a post', function(done) {
        posts.forEach(function(post) {
            proc.process(post);
            should.exist(post.date);
            post.date.should.eql(post.correctDate);
        });
        done();
    });

    it('should set the description of a post', function(done) {
        proc.getDescription(posts[1], null, function(res) {
            should.exist(res);
            done();
        });
    });
});

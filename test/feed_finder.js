var should = require('should')
  , eyes   = require('eyes')
  , util   = require('../lib/util.js')
  , Finder = require('../lib/feed_finder.js')
  , finder = new Finder()
  , urls   = [ 
        { link: 'http://www.mikealrogers.com/site.rss', valid: true }
      , { link: 'http://www.mikealrogers.com', valid: true }
      , { link: 'http://www.sauria.com/blog/feed/', valid: true }
      , { link: 'http://weblog.bocoup.com/feed', valid: false }
      , { link: 'http://blip.tv/rss/bookmarks/234675', valid: true }
      , { link: 'http://blip.tv', valid: false }
      , { link: 'http://labnotes.org', valid: true }
      , { link: 'http://blog.wraithan.net', valid: true }
      , { link: 'http://dev.estisia.com', valid: true }
      , { link: 'http://www.joelonsoftware.com', valid: true }
      , { link: 'http://www.paulgraham.com', valid: true }
      , { link: 'http://blog.paracode.com', valid: true }
      , { link: 'http://blog.grouptalent.com', valid: true }
      , { link: 'http://grouptalent.com', valid: false }
      , { link: 'http://www.notablogurl.com/feed/', valid: false }
      , { link: 'blog.nodejitsu.com', valid: true }
    ]

  , valid   = urls.filter(function(u) { return u.valid; })
  , invalid = urls.filter(function(u) { return !u.valid; });

eyes.defaults.maxLength = 8192;

describe('SLOW - feed_finder', function() {
    it('should return all feeds found', function(done) {
        util.cont(valid, done, function(item, cont) {
            finder.find(item.link,  function(feeds) {
                should.exist(feeds);
                feeds.length.should.be.greaterThan(0);
                cont();
            });
        });
    });

    it('should return an empty array if a feed is not found', function(done) {
        util.cont(invalid, done, function(item, cont) {
            finder.find(item.link, function(feeds) {
                feeds.length.should.equal(0);
                cont();
            });
        });
    });

    it('should return a feed array', function(done) {
        var search = 'fox';
        finder.find(search, function(feeds) {
            feeds.should.be.an.instanceof(Array);
            done();
        });
    });
});

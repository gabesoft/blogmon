var should = require('should'),
    util   = require('../lib/util.js'),
    Finder = require('../lib/feed_finder.js'),
    finder = new Finder();

var urls = [ 
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
  , { link: 'http://blog.paracode.com', valid: true }
  , { link: 'http://blog.grouptalent.com', valid: true }
  , { link: 'http://grouptalent.com', valid: false }
  , { link: 'http://www.notablogurl.com/feed/', valid: false }
];

var valid = urls.filter(function(u) { return u.valid; });
var invalid = urls.filter(function(u) { return !u.valid; });

describe('SLOW - feed_finder', function() {
    it('should return the url of a valid feed', function(done) {
        util.cont(valid, done, function(item, cont) {
            finder.find(item.link,  function(feed) {
                should.exist(feed);
                cont();
            });
        });
    });

    it('should return null if a feed is not found', function(done) {
        util.cont(invalid, done, function(item, cont) {
            finder.find(item.link, function(feed) {
                should.not.exist(feed);
                cont();
            });
        });
    });
});

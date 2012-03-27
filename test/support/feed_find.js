var fs          = require('fs')
  , xml2js      = require('xml2js')
  , eyes        = require('eyes')
  , path        = require('path')
  , trav        = require('traverse')
  , FeedParser  = require('feedparser')
  , util        = require('../../lib/util.js')
  , url         = require('url')
  , request     = require('request')
  , dir         = __dirname + '/../files';

var urls = [ 
    'http://www.mikealrogers.com/site.rss'
  , 'http://blog.izs.me/rss'
  , 'http://io.kodfabrik.com/atom.xml'
  , 'http://blog.nodejitsu.com/feed.xml'
  , 'http://blog.nodeknockout.com/rss'
  , 'http://blog.nodejs.org/feed/'
  , 'http://feeds.feedburner.com/3rd-eden'
  , 'http://marcorogers.com/blog/rss'
  , 'http://www.sauria.com/blog/feed/'
  , 'http://weblog.bocoup.com/feed'
  , 'http://nodejs.ir/blog/feed.xml'
  , 'https://tootallnate.net/feed.xml'
  , 'http://digitaltumbleweed.com/rss.xml'
  , 'http://talkweb.eu/c/nodejs/feed'
  , 'http://antirobotrobot.tumblr.com/rss'
  , 'http://metaduck.com/tagged/node.js/rss'
  , 'http://blip.tv/rss/bookmarks/234675'
  , 'http://labnotes.org/feed/atom/'
  , 'http://www.it-wars.com/feed.php?atom'
  , 'http://www.curlybracecast.com/itunes.rss'
  , 'http://feeds.feedburner.com/NodeUp'
  , 'http://feeds.feedburner.com/nunojob'
  , 'http://davestevens.us/feed'
  , 'http://feeds.shapeshed.com/shapeshed'
  , 'http://siriux.net/tag/node/feed/'
  , 'http://www.catonmat.net/feed/'
  , 'http://robkuz-blog.blogspot.com/feeds/posts/default'
  , 'http://developmentseed.org/blog/nodejs.rss/'
  , 'http://blog.wraithan.net/feeds/posts/default/-/nodejs'
  , 'http://hypermegatop.calepin.co/feeds/all.atom.xml'
  , 'http://www.nodejs-news.com/feed/'
  , 'http://dev.estisia.com/tag/nodejs/feed/'
  , 'http://www.joelonsoftware.com/rss.xml'
  , 'http://blog.paracode.com/atom.xml'
  , 'http://blog.grouptalent.com/feed/'
  , 'http://www.notablogurl.com/feed/'
];

var hostnames = urls.map(function(u) { 
    var keep = {};
    keep['feeds.feedburner.com'] = true;
    keep['www.sauria.com'] = true;
    keep['www.notablogurl.com'] = true;
    var host = url.parse(u).hostname;
    return keep[host] ? u : host;
});

util.each(hostnames, function(host) {
    var apiurl = 'http://www.google.com/reader/api/0/feed-finder?output=json&q=' + host;
    request(apiurl, function(err, res, body) {
        var data = JSON.parse(body);
        eyes.inspect(data);
        //if (data.items && data.items.length > 0) {
            //console.log(host, '\t', '\t', data.items[0].feed[0].href);
        //} else if (data.feed && data.feed.length > 0) {
            //console.log(host, '\t', '\t', data.feed[0].href);
        //} else {
            //console.log(host, '\t', '\t', 'URL NOT FOUND');
            //eyes.inspect(data);
        //}
    });
});

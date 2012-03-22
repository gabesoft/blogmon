var Aggregator = require('../../lib/aggregator.js'),
    redis      = require('redis').createClient(),
    Feed       = require('../../lib/model/feed.js'),
    Post       = require('../../lib/model/post.js'),
    feed       = new Feed(redis),
    post       = new Post(redis),
    index      = 0,
    urls       = [],
    agg        = new Aggregator(feed, post, 600), // 10 minutes interval
    run        = null;

redis.select(5);
redis.debug_mode = true;
redis.on('error', function(err) {
    console.log(err);
});
agg.on('feed-updated', function(errors, feed, count) {
    console.log('updated', feed, count);
});
agg.on('feed-unchanged', function(errors, feed) {
    console.log('unchanged', feed);
});

urls = [ 
    'http://www.mikealrogers.com/site.rss',
    'http://blog.izs.me/rss',
    'http://io.kodfabrik.com/atom.xml',
    'http://blog.nodejitsu.com/feed.xml',
    'http://blog.nodeknockout.com/rss',
    'http://blog.nodejs.org/feed/',
    'http://feeds.feedburner.com/3rd-eden',
    'http://marcorogers.com/blog/rss',
    'http://www.sauria.com/blog/feed/',
    'http://weblog.bocoup.com/feed',
    'http://nodejs.ir/blog/feed.xml',
    'https://tootallnate.net/feed.xml',
    'http://digitaltumbleweed.com/rss.xml',
    'http://talkweb.eu/c/nodejs/feed',
    'http://antirobotrobot.tumblr.com/rss',
    'http://metaduck.com/tagged/node.js/rss',
    'http://blip.tv/rss/bookmarks/234675',
    'http://labnotes.org/feed/atom/',
    'http://www.it-wars.com/feed.php?atom',
    'http://www.curlybracecast.com/itunes.rss',
    'http://feeds.feedburner.com/NodeUp',
    'http://feeds.feedburner.com/nunojob',
    'http://davestevens.us/feed',
    'http://feeds.shapeshed.com/shapeshed',
    'http://siriux.net/tag/node/feed/',
    'http://www.catonmat.net/feed/',
    'http://robkuz-blog.blogspot.com/feeds/posts/default',
    'http://developmentseed.org/blog/nodejs.rss/',
    'http://blog.wraithan.net/feeds/posts/default/-/nodejs',
    'http://hypermegatop.calepin.co/feeds/all.atom.xml',
    'http://www.nodejs-news.com/feed/',
    'http://dev.estisia.com/tag/nodejs/feed/',
    'http://www.joelonsoftware.com/rss.xml',
    'http://blog.paracode.com/atom.xml'
];

urls.forEach(function(url) {
    agg.runNow(url);
});

run = function() {
    if (index === urls.length) {
        agg.run();
    } else {
        agg.runNow(urls[index], function(err, uri) {
            index = index + 1;
            run();
        });
    }
};

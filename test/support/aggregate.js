var Aggregator = require('../../lib/aggregator.js'),
    redis      = require('redis').createClient(),
    util       = require('../../lib/util.js'),
    index      = 0,
    urls       = [],
    agg        = new Aggregator(redis, 600), // 10 minutes interval
    run        = null;

redis.select(5);
redis.debug_mode = true;
redis.on('error', function(err) {
    console.log(err);
});
agg.on('feed-updated', function(feed, count) {
    console.log('updated', feed, count);
});
agg.on('feed-unchanged', function(feed) {
    console.log('unchanged', feed);
});

urls = [ 
    'http://www.mikealrogers.com/site.rss',
    'http://blog.izs.me/rss',
    'http://io.kodfabrik.com/atom.xml',
    'http://blog.nodejitsu.com/feed.xml',
    'http://blog.nodejs.org/feed/',
    'http://feeds.feedburner.com/3rd-eden',
    'http://marcorogers.com/blog/rss',
    'http://www.sauria.com/blog/feed/',
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
    'http://blog.paracode.com/atom.xml',
    'http://feeds.reuters.com/reuters/artNews',
    'http://feeds.reuters.com/reuters/businessNews',
    'http://feeds.reuters.com/ReutersBusinessTravel',
    'http://feeds.reuters.com/reuters/companyNews',
    'http://feeds.reuters.com/Counterparties',
    'http://feeds.reuters.com/reuters/Election2012',
    'http://feeds.reuters.com/reuters/entertainment',
    'http://feeds.reuters.com/reuters/environment',
    'http://feeds.reuters.com/reuters/healthNews',
    'http://feeds.reuters.com/reuters/lifestyle',
    'http://feeds.reuters.com/reuters/mediaNews',
    'http://feeds.reuters.com/reuters/USpersonalfinanceNews',
    'http://feeds.reuters.com/reuters/MostRead',
    'http://feeds.reuters.com/reuters/oddlyEnoughNews',
    'http://feeds.reuters.com/ReutersPictures',
    'http://feeds.reuters.com/reuters/peopleNews',
    'http://feeds.reuters.com/Reuters/PoliticsNews',
    'http://feeds.reuters.com/reuters/scienceNews',
    'http://feeds.reuters.com/reuters/sportsNews',
    'http://feeds.reuters.com/reuters/technologyNews',
    'http://feeds.reuters.com/reuters/topNews',
    'http://feeds.reuters.com/Reuters/domesticNews',
    'http://feeds.reuters.com/Reuters/worldNews',
    'http://news.yahoo.com/rss/',
    'http://feeds.feedburner.com/cnet/tcoc?tag=txt',
    'http://www.washingtonpost.com/rss',
    'http://news.bbc.co.uk/rss/newsonline_uk_edition/front_page/rss091.xml',
    'http://www.kiplinger.com/about/rss/kiplinger.rss',
    'http://www.smartmoney.com/rss/smheadlines.cfm?feed=1&format=RSS091',
    'http://sports.espn.go.com/espn/rss/news',
    'http://partners.userland.com/nytRss/opinion.xml',
    'http://rssnewsapps.ziffdavis.com/pcmag.xml',
    'http://www.computerworld.com/news/xml/0,5000,54,00.xml',
    'http://slashdot.org/index.rss',
    'http://feeds.feedburner.com/TechCrunch/'
];

agg.run();
urls.forEach(util.bind(agg.runNow, agg));

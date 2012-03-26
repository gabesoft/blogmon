var fs          = require('fs'),
    xml2js      = require('xml2js'),
    eyes        = require('eyes'),
    path        = require('path'),
    trav        = require('traverse'),
    FeedParser  = require('feedparser'),
    util        = require('underscore'),
    dir         = __dirname + '/../files';

eyes.defaults.maxLength = 8192;

// parse feed
fs.readdir(dir, function(err, files) {
    files.forEach(function(file) {
        file = path.join(dir, file);
        //console.log(file);

        fs.readFile(file, function(err, data) {
            var parser = new FeedParser();
            parser.parseFile(file, function(err, meta, posts) {
                //eyes.inspect(file, 'file', { styles: { all: 'magenta' } });
                //eyes.inspect(meta);
                //eyes.inspect(posts);
            });

            //var xmlparser = new xml2js.Parser();
            //xmlparser.parseString(data, function(err, json) {
            //var structure = trav(json).map(function(x) {
            //if (typeof x === 'string') {
            //var key = this.key.toLowerCase();
            //var arr = ['pubdate', 'updated', 'lastbuilddate', 'published', 'issued'];
            //if (key === 'pubdate' || key === 'updated' || key === 'lastbuilddate') {
            //this.update(Date.parse(x));
            //} else {
            //this.update(x.substring(0, 30));
            //}
            //}
            //});

            //structure.type = Object.hasOwnProperty.call(json, 'channel') ? 'rss' : 'atom';

            //eyes.inspect(json);
            //console.log('structure');
            //eyes.inspect(structure);
            //});
        });
    });
});

var allurls = [ 
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



// request feed
var request = require('request');
var urls = [
    'http://www.joelonsoftware.com/rss.xml'
    //, "http://www.sauria.com/blog/feed/"
    //, "http://www.mikealrogers.com/site.rss"
    //, "http://blog.izs.me/rss"
    //, "http://blog.nodejitsu.com/feed.xml"
    //, "http://www.it-wars.com/feed.php?atom"
    //, "http://decafbad.com/blog/rss.xml"
];

urls.forEach(function(url) {
    var date = "Mon, 05 Mar 2012 21:38:09 GMT";
    var etag = '"bac173a4f3e06c85192038aaabd86f69"';
    var robj = {
        uri: url,
        headers: {
            "If-Modified-Since": date,
            "If-None-Match": etag
        }
    };
    request(robj, function(err, res, body) {
        //eyes.inspect(url, 'url', { styles: { all: 'magenta' } });
        //eyes.inspect(res.headers);

        if (body) {
            var parser = new FeedParser();
            parser.parseString(body, function(err, meta, posts) {
                // posts
                var slims = trav(posts).map(function(x) {
                    if (this.parents.length === 1 && !util.isNull(x)) {
                        var post = {
                            feedUri: robj.uri,
                            title: x.title || (x.description || '').substring(0, 100),
                            link: x.link,
                            date: '' + x.date,
                            pubdate: '' + x.pubdate,
                            author: x.author,
                            guid: x.guid,
                            image: x.image
                        };
                        this.update(post);
                        //this.update({ date: x.date, title: x.title });
                    }
                });
                console.dir(slims);
                //eyes.inspect(slims);
                //eyes.inspect(posts.length, 'length');
                //eyes.inspect(posts);

                // meta

                var feed = {
                    //id: robj.uri.replace(/[:\/.\-?]/g, ''),
                    uri: robj.uri,
                    lastModified: res.headers['last-modified'],
                    etag: res.headers.etag,
                    meta: {
                        title: meta.title,
                        description: meta.description,
                        link: meta.link,
                        author: meta.author,
                        language: meta.language,
                        image: meta.image,
                        date: meta.date
                    }
                };
                //eyes.inspect(feed);
                //eyes.inspect(meta);
            });
        }
    });
});



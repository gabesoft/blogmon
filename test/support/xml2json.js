var fs          = require('fs'),
    xml2js      = require('xml2js'),
    eyes        = require('eyes'),
    path        = require('path'),
    trav        = require('traverse'),
    FeedParser  = require('feedparser'),
    util        = require('../../lib/util.js');
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

// request feed
var request = require('request');
var urls = [
  "http://www.sauria.com/blog/feed/"
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
        eyes.inspect(url, 'url', { styles: { all: 'magenta' } });

        eyes.inspect(res.headers['last-modified'], 'last-modified');
        eyes.inspect(res.headers.etag, 'etag');

        eyes.inspect(res.headers);
        //eyes.inspect(body);

        if (body) {
          var parser = new FeedParser();
          parser.parseString(body, function(err, meta, posts) {
              var slims = trav(posts).map(function(x) {
                  if (this.parents.length === 1 && !util.check.nil(x)) {
                    this.update({ date: x.date, title: x.title });
                  }
              });
              eyes.inspect(slims);
              eyes.inspect(posts.length, 'length');
              eyes.inspect(meta);
              //eyes.inspect(posts);
          });
        }
    });
});

var should    = require('should')
  , fs        = require('fs')
  , path      = require('path')
  , eyes      = require('eyes')
  , util      = require('../lib/util.js')
  , jsdom     = require('jsdom')
  , $         = require('br-jquery').jquery()
  , Processor = require('../lib/processor/post_sanitizer.js')
  , proc      = new Processor()
  , dir       = __dirname + '/files.processor';

eyes.defaults.maxLength = 8192;

describe('post_sanitizer', function() {
    var me    = this
      , files = fs.readdirSync(dir)
      , remws = function(input) {
            return input
               .replace(/\n/g, '')
               .replace(/\s+/g, ' ');
        };

    files.forEach(function(file) {
        var fullPath = path.join(dir, file)
          , data     = fs.readFileSync(fullPath, 'utf8')
          , dom      = jsdom.jsdom(data)
          , window   = dom.createWindow()
          , doc      = $(window.document)
          , title    = util.str.sprintf('%s (%s)', doc.find('#title').html(), file)
          , input    = doc.find('#input').html()
          , expected = remws(doc.find('#expected').html());

        it.call(me, title, function(done) {
            proc.clean(input, function(res) {
                var actual = remws(res);
                actual.should.eql(expected);
                done();
            });
        });
    });

    it('should only return body contents', function(done) {
        var html = '<html><body><span>text</span></body></html>';
        proc.clean(html, function(res) {
            res.should.equal('<span>text</span>');
            done();
        });
    });

    it('should handle just text', function(done) {
        var html = 'a piece of text to be processed';
        proc.clean(html, function(res) {
            res.should.equal(html);
            done();
        });
    });
});

var FKEY = 'feeds',
    FKEY_BAK = 'feeds-bak',
    IDKEY = 'feed-ids',
    IDKEY_BAK = 'feed-ids-bak',
    util = require('../util.js');


function Feed (redis) {
  if (!(this instanceof Feed)) { return new Feed(redis); }
  this.redis = redis;
}

module.exports = Feed;

var mkid = function(item) {
  item.id = item.id || item.uri.replace(/[:\/.\-?]/g, '');
};

Feed.prototype.set = function(feeds, callback) {
  var data, ids, 
      redis = this.redis, 
      multi = redis.multi();

  data = util.isArray(feeds) ? feeds : [feeds];
  data.forEach(mkid);
  ids = data.map(function(x) {
      return x.id;
  });

  multi.rename(FKEY, FKEY_BAK);
  multi.rename(IDKEY, IDKEY_BAK);
  multi.del(FKEY);
  multi.del(IDKEY);
  multi.lpush(FKEY, data);
  multi.sadd(IDKEY, ids);
  multi.exec(function(err, res) {
      callback(err, res[res.length - 2], res[res.length - 1]);
  });
};

Feed.prototype.get = function(callback) {
  this.redis.lrange(FKEY, 0, -1, callback);
};

Feed.prototype.len = function(callback) {
  this.redis.llen(FKEY, callback);
};

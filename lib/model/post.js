var util = require('../util.js'),
    trav = require('traverse'),
    url = require('url');

function Post (redis) {
  if (!(this instanceof Post)) { return new Post(redis); }
  this.redis = redis;
}

module.exports = Post;

Post.prototype.add = function(posts, callback) {
  // body...
};

Post.prototype.get = function(feeds, start, limit, callback) {
  // body...
};

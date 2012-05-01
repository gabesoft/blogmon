var util            = require('../util.js')
  , Settings        = require('../model/user_settings.js')
  , defaultSettings = function(post) {
        return {
            visible  : true
          , expanded : false
          , flag     : 'none'
        };
    }
  , setPostSettings = function(repo, settings, guid, data, callback) {
        repo.setPostSettings(guid, data, function() {
            settings[guid] = data;
            callback();
        });
    }
  , decoratePosts = function(settings, posts, callback) {
        posts.forEach(function(post) {
            post.settings = settings[post.guid] || defaultSettings(post);
        });
        callback(posts);
    };

function UserSettingsHelper (redis, userId) {
    if (!(this instanceof UserSettingsHelper)) { 
        return new UserSettingsHelper(redis, userId);
    }
    this.repo = new Settings(redis, userId);
    this.settings = null;
}

module.exports = UserSettingsHelper;

UserSettingsHelper.prototype.populatePostSettings = function(posts, callback) {
    var me = this;
    posts  = util.isArray(posts) ? posts : [posts];

    if (util.nil(me.settings)) {
        me.repo.getAllPostSettings(function(list) {
            me.settings = list;
            decoratePosts(me.settings, posts, callback);
        });
    } else {
        decoratePosts(me.settings, posts, callback);
    }
};

UserSettingsHelper.prototype.setPostSettings = function(guid, settings, callback) {
    var me = this;
    if (util.nil(me.settings)) {
        me.repo.getAllPostSettings(function(list) {
            me.settings = list;
            setPostSettings(me.repo, me.settings, guid, settings, callback);
        });
    } else {
        setPostSettings(me.repo, me.settings, guid, settings, callback);
    }
};

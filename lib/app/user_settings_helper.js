var util     = require('../util.js')
  , eyes     = require('eyes')
  , Settings = require('../model/user_settings.js')
  , feeddef  = function() { return { visible : true }; }
  , postdef  = function() {
        return {
            visible  : true
          , expanded : false
          , flag     : 'none'
        };
    };

function UserSettingsHelper (redis, userId) {
    if (!(this instanceof UserSettingsHelper)) { 
        return new UserSettingsHelper(redis, userId);
    }
    this.repo = new Settings(redis, userId);
}

module.exports = UserSettingsHelper;

UserSettingsHelper.prototype.populate = function(type, items, def, callback) {
    items = util.isArray(items) ? items : [items];
    this.repo.get(type, null, function(settings) {
        items.forEach(function(item) {
            item.settings = settings[item.guid || item.id] || def();
        });
        callback(items);
    });
};

UserSettingsHelper.prototype.set = function(type, id, settings, callback) {
    this.repo.set(type, id, settings, callback);
};

UserSettingsHelper.prototype.populatePostSettings = function(posts, callback) {
    this.populate('post', posts, postdef, callback);
};

UserSettingsHelper.prototype.setPostSettings = function(guid, settings, callback) {
    this.set('post', guid, settings, callback);
};

UserSettingsHelper.prototype.populateFeedSettings = function(feeds, callback) {
    this.populate('feed', feeds, feeddef, callback);
};

UserSettingsHelper.prototype.setFeedSettings = function(id, settings, callback) {
    this.set('feed', id, settings, callback);
};

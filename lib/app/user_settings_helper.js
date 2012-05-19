var util     = require('../util.js')
  , eyes     = require('eyes')
  , Settings = require('../model/user_settings.js')
  , feeddef  = function() { return { settings: { visible : true } }; }
  , postdef  = function() {
        return {
            settings: {
                visible  : true
              , expanded : false
              , flag     : 'none'
            }
        };
    }
  , def = function(type) {
        return type === 'post' ? postdef() : feeddef();
    };

function UserSettingsHelper (redis, userId) {
    if (!(this instanceof UserSettingsHelper)) { 
        return new UserSettingsHelper(redis, userId);
    }
    this.repo = new Settings(redis, userId);
}

module.exports = UserSettingsHelper;

UserSettingsHelper.prototype.populate = function(type, items, callback) {
    items = util.isArray(items) ? items : [items];
    this.repo.get(type, null, function(settings) {
        items.forEach(function(item) {
            var obj = settings[item.guid || item.id] || def(type);
            util.extend(item, obj);
        });
        callback(items);
    });
};

UserSettingsHelper.prototype.set = function(type, id, settings, callback) {
    var config = {
            type: type
          , id: id
          , value: settings
        };
    this.repo.set(config, callback);
};

UserSettingsHelper.prototype.getMap = function(type, ids, callback) {
    ids = util.isArray(ids) ? ids : [ids];
    this.repo.get(type, null, function(settings) {
        ids.forEach(function(id) {
            if (util.nil(settings[id])) {
                settings[id] = def(type);
            }
        });
        callback(settings);
    });
};

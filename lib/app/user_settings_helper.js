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
    }
  , def = function(type) {
        return type === 'post' ? postdef() : feeddef();
    }
  , getSettings = function(type, obj) {
        obj = obj || {};
        obj.settings = util.exists(obj.settings) ? obj.settings : def(type);
        return obj;
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
            var id  = item.guid || item.id
              , obj = getSettings(type, settings[id]);
            util.extend(item, obj);
        });
        callback(items);
    });
};

UserSettingsHelper.prototype.set = function(type, name, id, value, callback) {
    var config = {
            type : type
          , name : name
          , id   : id
          , value: value
        };
    this.repo.set(config, callback);
};

UserSettingsHelper.prototype.getMap = function(type, ids, callback) {
    ids = util.isArray(ids) ? ids : [ids];
    this.repo.get(type, null, function(settings) {
        ids.forEach(function(id) {
            settings[id] = getSettings(type, settings[id]);
        });
        callback(settings);
    });
};

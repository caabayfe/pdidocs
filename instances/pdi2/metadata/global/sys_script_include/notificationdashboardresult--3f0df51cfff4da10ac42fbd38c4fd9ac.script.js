var NotificationDashboardResult = Class.create();
NotificationDashboardResult.prototype = {
    _resultList: null,
    _resultMap: {},
    _keyName: null,
    _aggregateFn: null,
    initialize: function(resultList, keyName) {
        this._resultList = resultList || [];
        this._keyName = keyName;
        this._createMap();
        var currentResults = this;
        this._aggregateFn = function(keyValue, anotherObject) {
            resultMap = currentResults.getResultMap();
            var item = resultMap[keyValue];
            if (item && anotherObject) {
                Object.assign(item, anotherObject);
            }
        };
    },
    _createMap: function() {
        for (var i = 0; i < this._resultList.length; i++) {
            var item = this._resultList[i];
            var keyValue = item[this._keyName];
            this._resultMap[keyValue] = item;
        }
    },
    getKeySet: function() {
        return Object.keys(this._resultMap);
    },
    getResultMap: function() {
        return this._resultMap;
    },
    getResultList: function() {
        return this._resultList;
    },
    aggregateFn: function() {
        return this._aggregateFn;
    },
	addChildren: function(keyValue, children) {
		var item = this._resultMap[keyValue];
		if (item) {
			item.children = children;
		}
	},
	getItem: function(keyValue) {
		return this._resultMap[keyValue];
	},
    type: 'NotificationDashboardResult'
};

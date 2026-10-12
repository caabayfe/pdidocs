var AISearchScopedCacheUtil = Class.create();
AISearchScopedCacheUtil.prototype = {
	initialize: function () {
	},

	getScopedCacheEntries: function (sysID) {
		var keys = [];
		var cacheKeys = sn_scoped_cache.ScopedCacheManager.getScopedCacheKeys("sn_ais_assist^sn_ais_assist_cache");
		if (gs.nil(cacheKeys))
			return keys;

		while (cacheKeys.hasNext()) {
			var key = cacheKeys.next();
			if(gs.nil(key))
				continue;
			
			var keyString = key.toString();
			if (keyString.includes(sysID))
				keys.push(keyString);
		}

		return keys;
	},

	type: 'AISearchScopedCacheUtil'
};

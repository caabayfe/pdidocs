var AssetPremiumUtils = Class.create();
AssetPremiumUtils.prototype = {
	initialize: function() {
	},
	type: 'AssetPremiumUtils',
};

AssetPremiumUtils.getLock = function(table, sysId) {
	var lock = new GlideLock(table + sysId);
	lock.setLockDuration(60 * 5); // 5 minutes
	return lock;
};

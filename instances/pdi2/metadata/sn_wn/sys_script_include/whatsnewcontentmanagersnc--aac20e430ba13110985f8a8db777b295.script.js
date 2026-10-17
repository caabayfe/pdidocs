var WhatsNewContentManagerSNC = Class.create();
WhatsNewContentManagerSNC.prototype = {
	initialize: function() {
	},

	refreshContent: function() {
		var appConfigContentCount = this._findAppConfigContentDistribution();

		new global.ProductContent().refreshContent("product/content/whatsnew", "content.zip");

		// No prior App Config data to consider
		if (Object.keys(appConfigContentCount).length === 0)
			return;

		var postAppConfigContentCount = this._findAppConfigContentDistribution();

		this._removeStaleActivityRecords(appConfigContentCount, postAppConfigContentCount);
	},

	_removeStaleActivityRecords: function(appConfigContentCount, postAppConfigContentCount) {
		var resetAppConfigSysIdList = [];
		for (var appConfigSysId in appConfigContentCount)
			if (postAppConfigContentCount[appConfigSysId] && postAppConfigContentCount[appConfigSysId] > appConfigContentCount[appConfigSysId])
				resetAppConfigSysIdList.push(appConfigSysId);

		var userAppActivityGR = new GlideRecord(WhatsNewCommonConstants.TABLE.SN_WN_USER_APP_ACTIVITY);
		userAppActivityGR.addQuery("app_config", resetAppConfigSysIdList);
		userAppActivityGR.query();
		userAppActivityGR.deleteMultiple();
	},

	_findAppConfigContentDistribution: function() {
		var appConfigCount = {};
		var userAppActivityGA = new GlideAggregate(WhatsNewCommonConstants.TABLE.SN_WN_APP_CONFIG_CONTENT_M2M);
		userAppActivityGA.groupBy("app_config");
		userAppActivityGA.addAggregate("COUNT", "content");
		userAppActivityGA.query();
		while (userAppActivityGA.next())
			appConfigCount[userAppActivityGA.getValue("app_config")] = parseInt(userAppActivityGA.getAggregate("COUNT", "content"));
		return appConfigCount;
	},

	type: 'WhatsNewContentManagerSNC'
};

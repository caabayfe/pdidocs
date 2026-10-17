var ActivitySubscriptionContextImpl = Class.create();
ActivitySubscriptionContextImpl.prototype = {
	initialize: function() {
		this.isCommunityPluginActive = pm.isActive('com.sn_communities');
		this.subscriptionDAO = new SubscriptionDAO(this);
		this.activityDAO = new ActivityDAO(this);
		this.activityContextDao = new ActivityContextDao(this);
		this.isCommunityPluginActive = pm.isActive('com.sn_communities');
	},
	isPluginEnabled: function() {
		var disableProperty = gs.getProperty('com.snc.actsub.core.disable_plugin', false);
		if (disableProperty === 'false')
			return true;
	},

	getSubscriptionService: function() {
		return this.getService(ActivityConstants.SUBSCRIPTION_SERVICE);
	},

	getActivityService: function() {
		return this.getService(ActivityConstants.ACTIVITY_SERVICE);
	},

	getSubscriptionDAO: function() {
		return this.subscriptionDAO;
	},

	getActivityDAO: function() {
		return this.activityDAO;
	},
	
	getActivityContextDao: function() {
		return this.activityContextDao;
	},

	getService: function(resourceName) {
		//inject context into the services
		switch (resourceName + "") {
			case ActivityConstants.ACTIVITY_FACET_SERVCE:
				return new ActivityFacetService(this);
			case ActivityConstants.ACTIVITY_SERVICE:
				return new ActivityService(this);
			case ActivityConstants.SUBSCRIPTION_SERVICE:
				return new SubscriptionService(this);
			case ActivityConstants.ACTIVITY_CONTEXT_SERVICE:
				return new ActivityContextService(this);
			case ActivityConstants.DEFLECTION_CONTEXT_SERVICE:
				return new sn_ssa_core.DeflectionContextService(this);
			case ActivityConstants.ACTIVITY_STREAM_PULL_SERVICE:
				return new ActivityStreamPullService(this);
		}
	},

	type: 'ActivitySubscriptionContextImpl'
};

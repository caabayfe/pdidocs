(function executeRule(current, previous /*null when async*/) {
	var isCacheEnabled = gs.getProperty("com.snc.actsub.activity.stream.cache.enable") == "true";
	if (!isCacheEnabled)
		return;

	var activityType = current.activity_type_id.getRefRecord();	
	if(activityType && activityType.undo_verb == current.verb)
		return;//do nothing for undo activities
	if (current.operation() == 'update' && !current.active.changes())
		return;

	var actSubCtx = global.ActivitySubscriptionContext.getContext();
	var subscriptionService = actSubCtx.getSubscriptionService();
	var subscribers;
	if(activityType){// Clear the cache.
		subscribers = subscriptionService.getAllSubscribers(current, activityType);
		if(subscribers){
			subscribers = filterByPermissions(current, subscribers);
			actSubCtx.getActivityService().flushStreamCacheForSubscribers(subscribers);
		}
	}
	
	function isEmpty(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}
		return JSON.stringify(obj) === JSON.stringify({});
	}
	function filterByPermissions(current, subscribers){
		if(GlidePluginManager.isActive('com.sn_communities')){
			if(current.target_name != sn_communities.CommunityConstants.FORUM_TABLE)
				return subscribers;//Need not check for forum permissions if activity doesn't contain a forum context.
			var forumData = new sn_communities.CommunityForum(current.target_id + '').isForPublicAccess();
			//return immediately if it is a public forum
			return (forumData == true) ? subscribers : new sn_communities.CommunityActivityService().filterByPermissions(current, subscribers);
		}
		return subscribers;
	}
})(current, previous);

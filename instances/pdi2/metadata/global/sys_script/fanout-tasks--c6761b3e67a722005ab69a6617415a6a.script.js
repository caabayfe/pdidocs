(function executeRule(current, previous /*null when async*/) {
	var actSubCtx = global.ActivitySubscriptionContext.getContext();
	var activityService = actSubCtx.getActivityService();
	activityService.initiateFanout(current);
	//gs.eventQueue('sn_actsub.activity_fanout',current,'','');

})(current, previous);

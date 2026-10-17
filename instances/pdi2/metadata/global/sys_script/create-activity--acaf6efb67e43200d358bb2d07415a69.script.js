(function executeRule(current, previous /*null when async*/) {

	if(gs.getProperty('glide.knowman.enable_km_subscription', 'true') == 'true') 
		new ActivitySubscriptionContext().getActivityService().createActivity(current,"commented");

})(current, previous);

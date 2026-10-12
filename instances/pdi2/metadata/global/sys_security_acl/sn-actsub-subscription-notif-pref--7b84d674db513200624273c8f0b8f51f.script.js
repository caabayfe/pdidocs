answer = execute();
function execute() {
	var subscriptionService = global.ActivitySubscriptionContext.getContext().getSubscriptionService();
	return subscriptionService.canFetchPreferences(current.subscription.subscriber_id.document + '');
}

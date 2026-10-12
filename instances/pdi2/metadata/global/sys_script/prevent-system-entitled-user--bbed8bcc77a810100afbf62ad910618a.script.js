(function executeRule(current, previous /*null when async*/) {
	var userSubHelper = new UserSubscriptionHelper();

	if (!userSubHelper.canUserBeRemovedFromSubscription(current.getValue('user'), current.getValue('license'))) {
		gs.addErrorMessage(gs.getMessage('System entitled users cannot be excluded.'));
		current.setAbortAction(true);
	}
})(current, previous);

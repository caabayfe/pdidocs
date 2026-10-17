(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (new sn_utc.UpgradePlanAPI().hasErrorUpgradePlanItems(current.getUniqueValue()))
		gs.addMessage('access', gs.getMessage('Upgrade plan error items message'));
})(current, previous);

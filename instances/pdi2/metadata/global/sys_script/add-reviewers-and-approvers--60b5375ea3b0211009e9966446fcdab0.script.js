(function executeRule(current, previous /*null when async*/) {
	var platformDocRuleUtils = new PlatformDocRuleUtils(current.sys_id);
	platformDocRuleUtils.addApproversAndReviewers();
})(current, previous);

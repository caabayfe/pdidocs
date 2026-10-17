(function executeRule(current, previous /*null when async*/) {

	new AuthPolicyDecisionTableUtil().flushDecisionTableFromCache(current.policy.decision_table);

})(current, previous);

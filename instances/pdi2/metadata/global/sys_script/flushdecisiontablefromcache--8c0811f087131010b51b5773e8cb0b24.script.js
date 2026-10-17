(function executeRule(current, previous /*null when async*/) {

	new AuthPolicyDecisionTableUtil().flushDecisionTableFromCache(current.decision_table);

})(current, previous);

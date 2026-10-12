(function executeRule(current, previous /*null when async*/) {
	if (previous == null)
		g_scratchpad.originalDecisionType = current.decision_type;
	else
		g_scratchpad.originalDecisionType = previous.decision_type;
})(current, previous);

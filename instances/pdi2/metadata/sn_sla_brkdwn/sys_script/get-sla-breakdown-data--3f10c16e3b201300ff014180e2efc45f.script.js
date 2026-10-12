(function executeRule(current, previous /*null when async*/) {
	if (!current.isNewRecord()) {
		var breakdownFields = new TaskSLABreakdownUtils(current).getBreakdownFields("sla_breakdown_by_assignment");
		breakdownFields.sort();
		g_scratchpad.breakdownFields = breakdownFields.join("^");
	}
})(current, previous);

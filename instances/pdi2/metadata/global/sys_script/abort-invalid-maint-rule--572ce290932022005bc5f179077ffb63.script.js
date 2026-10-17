(function executeRule(current, previous /*null when async*/) {

	var im = new SNC.ImpactManager();
	if (!im.verifyMaintRuleIsValid(current.table, current.ci_field)) {
		gs.addErrorMessage(gs.getMessage("Invalid table or CI field name"));
		current.setAbortAction(true);
	}

})(current, previous);

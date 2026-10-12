(function executeRule(current, previous /*null when async*/) {
	if (current.active == false) {
		current.setAbortAction(true);
		//for user message on list view
		gs.addErrorMessage(gs.getMessage("The definition for the Configuration Item class (cmdb_ci) can not be deactivated."));
		gs.info(gs.getMessage("CMDB Retirement Definition: The definition for the Configuration Item class (cmdb_ci) can not be deactivated."))
	}

})(current, previous);

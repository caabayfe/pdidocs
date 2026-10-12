(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	if (current.operation() == "delete") {
		gs.addErrorMessage("Cannot delete sp_config portal - it is needed for Service Portal configuration");
		return;
	}
	
	gs.addErrorMessage("Cannot change URL suffix of sp_config portal - it is needed for Service Portal configuration");

})(current, previous);

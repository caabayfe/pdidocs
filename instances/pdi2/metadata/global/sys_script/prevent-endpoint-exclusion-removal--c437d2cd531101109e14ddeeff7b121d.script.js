(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Manual service CI type exclusion list must include 'cmdb_ci_endpoint'."));
	
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	
	if(current.sys_created_by == 'admin'){
		gs.addErrorMessage(gs.getMessage("Deleting CMDB Policy Type is not allowed."));
		current.setAbortAction(true);
	}
	
})(current, previous);

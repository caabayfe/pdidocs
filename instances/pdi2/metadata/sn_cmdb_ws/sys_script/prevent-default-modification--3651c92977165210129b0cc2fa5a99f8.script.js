(function executeRule(current, previous /*null when async*/) {

	if (!gs.hasRole('sn_cmdb_admin')) {
		gs.addErrorMessage(gs.getMessage("Only CMDB admin can modify default configuration"));
		current.setAbortAction(true);
	}

})(current, previous);

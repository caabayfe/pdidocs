(function executeRule(current, previous /*null when async*/) {
	// ensure connection name does not contain special characters like >, < to avoid XSS
	if (current.name.match(/[^A-Za-z0-9_ @./()#&+\-=!*]/)){
		gs.addErrorMessage(gs.getMessage("Invalid connection name"));
		current.setAbortAction(true);
		return false;
	}
	return true;
})(current, previous);

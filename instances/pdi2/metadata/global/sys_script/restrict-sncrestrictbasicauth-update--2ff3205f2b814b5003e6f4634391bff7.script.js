(function executeRule(current, previous /*null when async*/) {
	// Check if security_admin is actively elevated, not just assigned
	if (!gs.getSession().hasRole('security_admin')) {
		current.setAbortAction(true);
		gs.addErrorMessage('Insufficient privileges to modify this record. Elevate to security_admin and try again.');
	}
})(current, previous);

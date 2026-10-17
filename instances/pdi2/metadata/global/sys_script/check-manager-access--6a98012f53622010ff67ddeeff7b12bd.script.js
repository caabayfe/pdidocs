(function executeRule(current, previous /*null when async*/) {

	var hasManagerAccess = new OnCallSecurityNG().rotaMgrAccess(current.group);
	if (!hasManagerAccess) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('You do not have access to create escalation for this group'));
	}

})(current, previous);

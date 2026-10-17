(function executeRule(current, previous /*null when async*/) {

	if (current.service_profile.nil() && current.service_profile_table.nil()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('The default Email OTP configuration cannot be deleted.'));
	}

})(current, previous);

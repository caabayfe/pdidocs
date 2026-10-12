(function executeRule(current, previous /*null when async*/) {

	if (previous.service_profile.nil() && previous.service_profile_table.nil()) {
		if (current.service_profile.changes() || current.service_profile_table.changes() || current.active.changes()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('The service profile and active fields on the default Email OTP configuration cannot be modified.'));
		}
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	var userPreferenceSysId = current.on_call_user_preference + '';
	if (userPreferenceSysId && current.on_call_user_preference.getRefRecord().isValidRecord()) {
		var maxContactAttempt = new OnCallUserPreferences().getHighestOrderContactAttempt(userPreferenceSysId);
		if (maxContactAttempt !== parseInt(current.contact_attempt) && !current.contact_attempt.nil()) {
			gs.addErrorMessage(gs.getMessage('Deletion of contact preference only with highest order is allowed, to preserve attempt sequence.'));
			current.setAbortAction(true);
		}
	}
	

})(current, previous);

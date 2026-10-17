(function executeRule(current, previous /*null when async*/) {
	var slaDef = new SLADefinition();
	slaDef.setDuration(current.duration.dateNumericValue());
	var durationMsg = slaDef.validateDurationValue();

	if (durationMsg) {
		gs.addErrorMessage(durationMsg);
		current.setAbortAction(true);
		gs.setRedirectURL(current);
		gs.getSession().putClientData('invalidDuration', true);
	} else
		gs.getSession().putClientData('invalidDuration', false);
})(current, previous);

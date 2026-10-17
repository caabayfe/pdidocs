(function executeRule(current, previous /*null when async*/) {

	var valid = new OCRotaMember().validateDates(current.from+'', current.to+'');
	if (!valid) {
		gs.addErrorMessage(gs.getMessage('Please ensure the member\'s ({0}) From date is before or equal to the To date', [current.member.getDisplayValue()]));
		current.setAbortAction(true);
		return false;
	}

})(current, previous);

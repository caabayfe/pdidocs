(function executeRule(current, previous /*null when async*/) {

	var isOverlapping = new OnCallContactPreferenceUtil().isScheduleOverlappingWithOtherPreferences(current);
	if (isOverlapping) {
		gs.addErrorMessage(gs.getMessage('Schedule configuration is overlapping with your other preferences'));
		current.setAbortAction(true);
	}

})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	if (!(new OnCallGrpPreferenceUtil().validateUniqueGroupInPreferences(current)))
		current.setAbortAction(true);

})(current, previous);

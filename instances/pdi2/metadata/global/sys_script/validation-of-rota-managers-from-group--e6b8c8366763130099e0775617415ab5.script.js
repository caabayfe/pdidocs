(function executeRule(current, previous /*null when async*/) {

	if (!(new OnCallGrpPreferenceUtil().validateRotaManagersFromPreferenceList(current)))
		current.setAbortAction(true);

})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	if(!(new StdChangeUtils().isStandardChangeSetupValid())) {
		current.setAbortAction(true);
	}

})(current, previous);

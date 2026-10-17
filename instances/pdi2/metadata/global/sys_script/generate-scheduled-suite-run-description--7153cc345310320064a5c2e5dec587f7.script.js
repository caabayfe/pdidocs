(function executeRule(current, previous /*null when async*/) {
	var hasTestSuiteId = current.test_suite != "";
	if (!hasTestSuiteId) {
		gs.addErrorMessage(gs.getMessage("Test suite field must be populated"), "suiteFieldMustBePopulated");
		current.setAbortAction(true);
		return;
	}

	new ScheduledTestProcessor().setScheduleRunDescription(current);

})(current, previous);

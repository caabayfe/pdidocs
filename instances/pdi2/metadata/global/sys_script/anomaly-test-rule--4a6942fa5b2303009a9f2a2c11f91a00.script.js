(function executeRule(current, previous /*null when async*/) {
	var result = SNC.MetricScriptableApis.validateAnomalyTestRule(current.rule, current.start_date, current.end_date);
	if (result.getErrorStatus() == true){
		gs.addErrorMessage(result.getErrorMessage());
		current.setAbortAction(true);
	} else if (!gs.nil(result.getErrorMessage())) {
		gs.addErrorMessage(result.getErrorMessage());
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if(!SNC.MetricScriptableApis.canAddMetricSetting(current)){
		// Failed the validation, do not insert the record
		var message = gs.getMessage('Failed to create the setting. Please input valid setting.');
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}

})(current, previous);

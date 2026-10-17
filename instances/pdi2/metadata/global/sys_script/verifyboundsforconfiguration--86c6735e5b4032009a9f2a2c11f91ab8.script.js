(function executeRule(current, previous /*null when async*/) {
	if(!SNC.MetricScriptableApis.canAddConfigurationForFilter(current)){
		// Failed the validation, do not insert the record
		var message = gs.getMessage('Invalid input value, please insert the value in the supported range');
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}

})(current, previous);

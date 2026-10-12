(function executeRule(current, previous /*null when async*/) {
	var daysLimitPropStr = gs.getProperty("glide.evaluation.maximum_days", "180");
	var maximumDaysLimit = parseInt(daysLimitPropStr);
	if (current.minimum_days > maximumDaysLimit) {
		gs.addErrorMessage(gs.getMessage('Minimum Days Exceeds the Limit of {0}', daysLimitPropStr));
		current.setAbortAction(true);
	}

	var signalsLimitPropStr = gs.getProperty("glide.evaluation.maximum_signals", "500000");
	var maximumSignalsLimit = parseInt(signalsLimitPropStr);
	if (current.minimum_signals > maximumSignalsLimit) {
		gs.addErrorMessage(gs.getMessage('Minimum Signals Exceeds the Limit of {0}', signalsLimitPropStr));
		current.setAbortAction(true);
	}
})(current, previous);

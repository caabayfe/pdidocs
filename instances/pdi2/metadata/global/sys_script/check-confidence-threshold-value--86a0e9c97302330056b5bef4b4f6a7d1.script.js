(function executeRule(current, previous /*null when async*/) {

	if(current.confidence_threshold < 0 || current.confidence_threshold > 1) {
		gs.addErrorMessage(gs.getMessage('Threshold should be 0-1'));
		current.setAbortAction(true);
	}

})(current, previous);

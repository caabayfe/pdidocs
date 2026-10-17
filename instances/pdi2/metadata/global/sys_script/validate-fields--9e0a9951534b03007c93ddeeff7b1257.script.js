(function executeRule(current, previous /*null when async*/) {
	
	if (current.urgent_percentage < 0 || current.urgent_percentage > 100 ||
		current.high_percentage < 0 || current.high_percentage > 100 ||
	current.moderate_percentage < 0 || current.moderate_percentage > 100 ||
	current.low_percentage < 0 || current.low_percentage > 100) {
		
		gs.addErrorMessage(gs.getMessage('Group percentage must be between 0 to 100. Cannot save this configuration'));
		current.setAbortAction(true);
		
	} else {
		
		var total = current.urgent_percentage + current.high_percentage + current.moderate_percentage + current.low_percentage;
		if (total != 100) {
			gs.addErrorMessage(gs.getMessage('Total sum of group percentage must be 100. Cannot save this configuration'));
			current.setAbortAction(true);
		}
	}
	
	//urgent_quantitative_limit
	if (current.urgent_quantitative_limit < 0 || current.high_quantitative_limit < 0 || 
		current.moderate_quantitative_limit < 0 || current.low_quantitative_limit < 0) {
		
		gs.addErrorMessage(gs.getMessage('Group quantitative limit should be greater than or equal to 0. Cannot save this configuration'));
		current.setAbortAction(true);
	}
	
	
	
	
})(current, previous);

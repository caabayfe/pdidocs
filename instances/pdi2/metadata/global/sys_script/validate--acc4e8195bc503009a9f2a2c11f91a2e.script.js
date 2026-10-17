(function executeRule(current, previous /*null when async*/) {

	var className=current.class_type;
	var errorMessage = '';
	var upper = parseFloat(current.upper_bound);
	var lower = parseFloat(current.lower_bound);
	if(upper <= lower){
		errorMessage = gs.getMessage('Upper Bound should be greater than Lower Bound');
		gs.addErrorMessage(errorMessage);
		current.setAbortAction(true);
		return;
	}
	
	var minThreshold = parseFloat('0.0');
    
	// Upper width override exists
	if(!current.upper_width_override.nil()){
		var upperWidthOverride=parseFloat(current.upper_width_override);
		if(upperWidthOverride <= minThreshold ){
			errorMessage = gs.getMessage('Upper width override should be greater than 0');
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
			return;
		}
	}
	// Lower width override exists
	if(!current.lower_width_override.nil()){
		var lowerWidthOverride=parseFloat(current.lower_width_override);
		if(lowerWidthOverride <= minThreshold ){
			errorMessage = gs.getMessage('Lower width override should be greater than 0');
			gs.addErrorMessage(errorMessage);
			current.setAbortAction(true);
			return;
		}
	}
})(current, previous);

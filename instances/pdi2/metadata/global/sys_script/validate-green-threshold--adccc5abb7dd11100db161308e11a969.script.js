(function executeRule(current, previous /*null when async*/) {
	var sysPropertyRecord = new GlideRecord('sys_properties');
	var yellowThresholdRecord = sysPropertyRecord.get('8e51b77473021010c7b736e8fdf6a746');
	var yellowThreshold = sysPropertyRecord.value;
	
	var upperBound = 100;
	if(isNaN(current.value)) {
		gs.addErrorMessage(gs.getMessage("Please enter numerical values only"));
		current.setAbortAction(true);
	}
	
	if(parseInt(current.value) <= parseInt(yellowThreshold)) {
		gs.addErrorMessage(gs.getMessage("The following threshold: {0} is below or equal to your current Yellow threshold: {1}", [GlideStringUtil.escapeHTML(current.value), GlideStringUtil.escapeHTML(yellowThreshold)]));
		current.setAbortAction(true);
	} else if(current.value > upperBound){
		gs.addErrorMessage(gs.getMessage("The following threshold: {0} is above the allowed threshold: {1}", [GlideStringUtil.escapeHTML(current.value), upperBound]));
		current.setAbortAction(true);
	}
})(current, previous);

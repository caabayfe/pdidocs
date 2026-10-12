(function executeRule(current, previous /*null when async*/) {
	
	var sysPropertyRecord = new GlideRecord('sys_properties');
	var greenThresholdRecord = sysPropertyRecord.get('56e0737473021010c7b736e8fdf6a759');
	var greenThreshold = sysPropertyRecord.value;
	
	var lowerBound = 1;
	if(isNaN(current.value)) {
		gs.addErrorMessage(gs.getMessage("Please enter numerical values only"));
		current.setAbortAction(true);
	}
	
	if(parseInt(current.value) >= parseInt(greenThreshold)) {
		gs.addErrorMessage(gs.getMessage("The following threshold: {0} is above or equal to your current Green threshold: {1}", [GlideStringUtil.escapeHTML(current.value), GlideStringUtil.escapeHTML(greenThreshold)]));
		current.setAbortAction(true);
	} else if (current.value < lowerBound) {
		gs.addErrorMessage(gs.getMessage("The following threshold: {0} is below the minimum threshold: {1}", [GlideStringUtil.escapeHTML(current.value), lowerBound]));
		current.setAbortAction(true);
	}

})(current, previous);

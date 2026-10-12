(function executeRule(current, previous /*null when async*/) {
	function isDifferent(key) {
		return (current.getValue(key) || current.getValue(key)) && (current.getValue(key) != previous.getValue(key));
	}
	
	var oldFieldsChanged = current.getValue("is_custom_location") === "1" && (isDifferent("location") || isDifferent("custom_map_id") || isDifferent("provider_key")); 
	if (oldFieldsChanged) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Please configure custom map config instead."));
	} else if (current.getValue("is_custom_location") === "1" && current.custom_map_config.nil()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Custom map config is required."));	   
	}
})(current, previous);

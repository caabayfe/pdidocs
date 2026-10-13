check();

function check(){
	var min_schedule = GlideProperties.getInt('evt_mgmt.connector.minimum_schedule',0);
	
	if (current.schedule < min_schedule) {
		var errMsg = gs.getMessage("Schedule must be greater than or equal to {0}", [min_schedule]);
		errorAndAbort(errMsg);
	}
	
	if (gs.nil(current.name.trim())) {
		var errMsg = gs.getMessage("Name should not be empty");
		errorAndAbort(errMsg);
	}
	
	function errorAndAbort(errMsg) {
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}
}

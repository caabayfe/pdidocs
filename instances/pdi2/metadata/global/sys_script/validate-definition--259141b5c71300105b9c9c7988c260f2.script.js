(function executeRule(current, previous /*null when async*/) {
	try {
		var vd = new sn_app_api.ValidateDefinition(current).isValid();
	} catch (err) {
		gs.error(err.getMessage());
		gs.addErrorMessage(err.getMessage());
	
		// Abort the modification
		current.setAbortAction(true);
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if(current.getValue("value") == null){
		var error = gs.getMessage("Default value should not be empty");
		current.setAbortAction(true);
		current.type.setError(error);
	}
})(current, previous);

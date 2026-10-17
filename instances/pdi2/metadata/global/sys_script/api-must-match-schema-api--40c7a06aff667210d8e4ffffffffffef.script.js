(function executeRule(current, previous /*null when async*/) {

	if (current.api != current.schema.api) {
		gs.addErrorMessage(gs.getMessage("Schema API does not match the selected API."));
		current.setAbortAction(true);
	}

})(current, previous);

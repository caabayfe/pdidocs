(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Change Requests cannot be created from an inactive Standard Change Template: {0}", current.std_change_producer_version.std_change_producer.name.getDisplayValue()));
	current.setAbortAction(true);
})(current, previous);

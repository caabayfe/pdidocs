(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Is main component field can not be set to true for bundle whose model category does not contain bundle"));
	current.setAbortAction(true);

})(current, previous);

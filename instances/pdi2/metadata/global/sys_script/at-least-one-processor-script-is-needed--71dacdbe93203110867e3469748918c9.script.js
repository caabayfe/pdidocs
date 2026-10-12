(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Either request or response processor script should be provided."));
	current.setAbortAction(true);
})(current, previous);

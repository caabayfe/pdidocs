(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Either Regular Search Result or Now Assist Genius Result should be included. "));
	current.setAbortAction(true);
})(current, previous);

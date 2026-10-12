(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("'portal' is a reserved word - choose another URL suffix"));
	current.setAbortAction(true);

})(current, previous);

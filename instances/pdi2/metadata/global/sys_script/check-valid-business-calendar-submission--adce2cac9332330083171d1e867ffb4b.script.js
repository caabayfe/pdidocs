(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	gs.addInfoMessage(gs.getMessage("Calendar field cannot be empty"));

})(current, previous);

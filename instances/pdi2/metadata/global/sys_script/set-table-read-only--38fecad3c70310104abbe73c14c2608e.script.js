(function executeRule(current, previous /*null when async*/) {

	gs.addInfoMessage(gs.getMessage("Table is read-only"));
	current.setAbortAction(true);

})(current, previous);

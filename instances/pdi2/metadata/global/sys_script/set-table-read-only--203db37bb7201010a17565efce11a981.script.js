(function executeRule(current, previous /*null when async*/) {

	gs.addInfoMessage(gs.getMessage("Table is in read mode"));
	current.setAbortAction(true);

})(current, previous);

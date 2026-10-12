(function executeRule(current, previous /*null when async*/) {

	current.setAbortAction(true);
	var infoMessage = gs.getMessage("Email digest intervals are restricted to be from one hour to one week (inclusive).");
	gs.addInfoMessage(infoMessage);

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("State cannot be changed for Change Tasks when the Change Request is on hold."));
	current.setAbortAction(true);
	gs.setRedirectURL(current);
})(current, previous);

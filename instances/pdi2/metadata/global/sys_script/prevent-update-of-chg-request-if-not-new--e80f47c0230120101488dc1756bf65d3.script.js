(function executeRule(current, previous /*null when async*/) {
	gs.addInfoMessage(gs.getMessage("{0} cannot be changed.", [current.change_request.getLabel()]));	
	current.setAbortAction(true);
	gs.setRedirectURL(current);
})(current, previous);

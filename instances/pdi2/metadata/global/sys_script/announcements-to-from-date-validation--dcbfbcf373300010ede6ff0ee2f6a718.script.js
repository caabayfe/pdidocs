(function executeRule(current, previous /*null when async*/) {
	if (!current.to.nil() && new GlideDateTime(current.from).after(new GlideDateTime(current.to))) {
		gs.addErrorMessage(gs.getMessage("From date must be prior to To date"));
		current.setAbortAction(true);
		return;
		
	}
	
})(current, previous);

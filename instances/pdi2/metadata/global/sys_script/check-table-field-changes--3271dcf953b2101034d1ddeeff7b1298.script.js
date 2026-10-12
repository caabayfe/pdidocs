(function executeRule(current, previous /*null when async*/) {

	var stateGr = new GlideRecord("sttrm_state");
	stateGr.addQuery("sttrm_model", current.getUniqueValue());
	stateGr.query();
	
	if (stateGr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("You cannot change the State field or Table name if states are associated"));
	}

})(current, previous);

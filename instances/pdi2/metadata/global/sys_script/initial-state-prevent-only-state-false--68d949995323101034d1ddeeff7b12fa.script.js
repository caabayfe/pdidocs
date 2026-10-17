(function executeRule(current, previous /*null when async*/) {
	//If there are no other states, prevent the update
	var stateGr = new GlideRecord("sttrm_state");
	stateGr.addQuery("sttrm_model", current.getValue("sttrm_model"));
	stateGr.addQuery("sys_id", "!=", current.getUniqueValue());
	stateGr.query();
	
	if (!stateGr.next()) {
		gs.addInfoMessage(gs.getMessage("Initial State cannot be false on a model with a single state"));
		current.setAbortAction(true);
	}

})(current, previous);

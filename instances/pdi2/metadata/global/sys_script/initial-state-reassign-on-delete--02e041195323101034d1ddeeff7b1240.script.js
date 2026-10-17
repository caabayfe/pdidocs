(function executeRule(current, previous /*null when async*/) {
	// If the initial state is deleted, set initial on the next available state
	var stateGr = new GlideRecord("sttrm_state");
	stateGr.addQuery("sttrm_model", current.getValue("sttrm_model"));
	stateGr.orderBy("state_sequence");
	stateGr.setLimit(1);
	stateGr.query();
	
	if(stateGr.next()) {
		stateGr.initial_state = true;
		stateGr.update();
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	var stateGr = new GlideRecord("sttrm_state");
	stateGr.addQuery("sttrm_model", current.getValue("sttrm_model"));
	stateGr.addQuery("initial_state", true);
	stateGr.query();
	
	while (stateGr.next()) {
		stateGr.initial_state = false;
		stateGr.update();
	}
})(current, previous);

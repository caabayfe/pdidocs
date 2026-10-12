(function executeRule(current, previous /*null when async*/) {

	var stateGr = new GlideRecord("sttrm_state");
	stateGr.addQuery("sttrm_model", current.getValue("sttrm_model"));
	stateGr.addQuery("sys_id", "!=", current.getUniqueValue());
	stateGr.orderBy("state_sequence");
	stateGr.setLimit(1);
	stateGr.query();
	
	if (stateGr.next()) {
		stateGr.setValue("initial_state", true);
		stateGr.update();
	}

})(current, previous);

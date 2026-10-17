(function executeRule(current, previous /*null when async*/) {

	var stateGr = new GlideRecord("sttrm_state");
	stateGr.addQuery("sttrm_model", current.getValue("sttrm_model"));
	stateGr.query();
	
	if (!stateGr.hasNext())
		current.setValue("initial_state", true);

})(current, previous);

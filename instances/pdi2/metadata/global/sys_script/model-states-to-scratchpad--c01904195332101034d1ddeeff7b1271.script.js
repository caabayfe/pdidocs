(function executeRule(current, previous /*null when async*/) {
	var model = new STTRMModel(current.sttrm_model.getRefRecord());
	g_scratchpad.sttrm_state = {
		"choices": model.getAvailableStateChoices(current.getValue("state_value"))
	};	
})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	var stateTransitionGr = new GlideRecord("sttrm_state_transition");
	stateTransitionGr.addQuery("to_state", current.getUniqueValue());
	stateTransitionGr.setLimit(1);
	stateTransitionGr.query();
	
	if (stateTransitionGr.next()) {
		current.setAbortAction(true);
		gs.addInfoMessage(gs.getMessage("States which are part of a transition cannot be deleted"));
	}

})(current, previous);

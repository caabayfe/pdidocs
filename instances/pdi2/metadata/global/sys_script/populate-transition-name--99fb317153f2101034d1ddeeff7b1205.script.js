(function executeRule(current, previous /*null when async*/) {

	current.name = gs.getMessage("{0} to {1}", [current.getDisplayValue("from_state"),current.getDisplayValue("to_state")]);

})(current, previous);

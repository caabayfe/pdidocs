(function executeRule(current, previous /*null when async*/) {

	if ((current.parent || previous.parent) && current.parent != previous.parent) {
		gs.addErrorMessage(gs.getMessage("Parent field is immutable"));
		current.setAbortAction(true);
	}

})(current, previous);

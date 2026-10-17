(function executeRule(current, previous /*null when async*/) {
	var target = current.getValue('mirror_target');
	var source = current.getValue('mirror_source');
	if (target == source) {
		gs.addErrorMessage(gs.getMessage("Target and Source Profiles must be different"));
		current.setAbortAction(true);
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (current.name == "*") {
		gs.addErrorMessage(gs.getMessage(
				"Duplicate wild card ux_route or ux_data_broker ACL"));
		current.setAbortAction(true);
		return;
	}
})(current, previous);

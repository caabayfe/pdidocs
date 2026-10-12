(function executeRule(current, previous /*null when async*/) {
	if (current.trigger_definition.trigger_inputs.table.changes()) {
		gs.addErrorMessage(gs.getMessage("Trigger definition cannot be updated because it changes the contract"));
		current.setAbortAction(true);
	}
})(current, previous);

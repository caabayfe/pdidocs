(function executeRule(current, previous /*null when async*/) {
	// If Action cannot be updated, we cannot add or remove Outputs, so abort
	if (!isActionSnapshot() && (isAddingToReadOnlyAction() || isRemovingFromReadOnlyAction())) {
		current.setAbortAction(true);
		gs.addErrorMessage("Cannot modify Outputs for an Action " +
						   "with restrictive security or protection policy");
		return;
	}
	
	// If no Action is set, leave Output policy as specified
	if (gs.nil(current.model))
		return;
	
	// Otherwise, inherit sys_policy from Action
	current.sys_policy = current.model.sys_policy;
	
	function isAddingToReadOnlyAction() {
		return !gs.nil(current.model) && !current.model.getRefRecord().canWrite();
	}
	
	function isRemovingFromReadOnlyAction() {
		return !gs.nil(previous.model) && !previous.model.getRefRecord().canWrite();
	}

	function isActionSnapshot() {
	 	return !gs.nil(current.model) && current.model.sys_class_name == "sys_hub_action_type_snapshot";
	}
})(current, previous);

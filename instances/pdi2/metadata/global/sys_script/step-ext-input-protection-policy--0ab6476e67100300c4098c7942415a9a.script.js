(function executeRule(current, previous /*null when async*/) {
	// If Step Instance cannot be updated, we cannot add or remove Inputs, so abort
	if (!isActionSnapshot() && (isAddingToReadOnlyStep() || isRemovingFromReadOnlyStep())) {
		current.setAbortAction(true);
		gs.addErrorMessage("Cannot modify Inputs for a Step Instance " +
						   "with restrictive security or protection policy");
		return;
	}
	
	// If no Step Instance is set, leave Input policy as specified
	if (gs.nil(current.model))
		return;
	
	// Otherwise, inherit sys_policy from Step Instance
	current.sys_policy = current.model.sys_policy;
	
	function isAddingToReadOnlyStep() {
		return !gs.nil(current.model) && !current.model.getRefRecord().canWrite();
	}
	
	function isRemovingFromReadOnlyStep() {
		return !gs.nil(previous.model) && !previous.model.getRefRecord().canWrite();
	}

	function isActionSnapshot() {
		if (gs.nil(current.model) || gs.nil(current.model.action))
			return false;

		return current.model.action.sys_class_name == "sys_hub_action_type_snapshot";
	}
})(current, previous);

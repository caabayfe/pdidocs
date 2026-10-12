(function executeRule(current, previous /*null when async*/) {
	// If Action cannot be updated, we cannot add or remove a Step, so abort
	if (!isActionSnapshot() && (isAddingToReadOnlyAction() || isRemovingFromReadOnlyAction())) {
		current.setAbortAction(true);
		gs.addErrorMessage("Cannot modify Steps for an Action " +
						   "with restrictive security or protection policy");
		return;
	}
	
	// If no Action is set, leave Step policy as specified
	if (gs.nil(current.action))
		return;
	
	// Otherwise, inherit sys_policy from Action
	current.sys_policy = current.action.sys_policy;
	
	function isActionSnapshot() {
		if (gs.nil(current.action))
			return false;
		
		return current.action.sys_class_name == "sys_hub_action_type_snapshot";
	}
	
	function isAddingToReadOnlyAction() {
		return !gs.nil(current.action) && !current.action.getRefRecord().canWrite();
	}
	
	function isRemovingFromReadOnlyAction() {
		return !gs.nil(previous.action) && !previous.action.getRefRecord().canWrite();
	}
})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if (!current.parent.nil()) {
		if (current.parent.state == 'committed') {
			current.setAbortAction(true);
			gs.addErrorMessage(current.parent.name + " " + gs.getMessage('Cannot be set as the parent because it is already committed.'));
			return;
		}
	}
	
	var previousParent = "";
	if(!previous.parent.nil())
		previousParent = previous.parent.sys_id;
	
	new SNC.HierarchyUpdateSetScriptable().setHierarchy(current, previousParent);

})(current, previous);

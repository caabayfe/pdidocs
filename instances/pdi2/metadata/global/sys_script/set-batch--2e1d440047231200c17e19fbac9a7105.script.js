(function executeRule(current, previous /*null when async*/) {
	var previousParent = "";
	if(!previous.parent.nil())
		previousParent = previous.parent.sys_id;
	
	new SNC.HierarchyUpdateSetScriptable().setHierarchy(current, previousParent);

})(current, previous);

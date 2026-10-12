(function executeRule(current, previous /*null when async*/) {
	var hierarchy = new SNC.HierarchyUpdateSetScriptable();
	hierarchy.deleteUpdateSetFromHierarchy(current);
	
})(current, previous);

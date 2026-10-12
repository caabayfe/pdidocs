var sn_remote_update_set_delete = "true";

(function executeRule(current, previous /*null when async*/) {
	var hierarchy = new SNC.HierarchyUpdateSetScriptable();
	hierarchy.deleteUpdateSetFromHierarchy(current);
	
})(current, previous);

sn_remote_update_set_delete = "false";

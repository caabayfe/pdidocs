(function executeRule(current, previous /*null when async*/) {
	// Check to see if we can reparent child services from new parent to current node
	var utils = new SPMTaxonomyUtils();
	utils.reparentNodeServices(current.sys_id, current.parent);
})(current, previous);

(function executeRule(current, previous) {
	
	// Delete the "Depends On" relation from BS to entry point, when an entry point is deleted.
	var smru = new ServiceMappingRelationUtil();
	smru.removeBs2EntryPointRel(current.getValue('cmdb_ci_service'), current.getValue('cmdb_ci_endpoint'));

})(current, previous);

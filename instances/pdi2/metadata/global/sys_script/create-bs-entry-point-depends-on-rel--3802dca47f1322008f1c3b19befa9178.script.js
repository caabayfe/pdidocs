(function executeRule(current, previous) {
	
	// Add a "Depends On" relation from BS to entry point, when a new entry point is inserted.	
	var smru = new ServiceMappingRelationUtil();
	smru.createBs2EntryPointRel(current.getValue('cmdb_ci_service'), current.getValue('cmdb_ci_endpoint'));

})(current, previous);

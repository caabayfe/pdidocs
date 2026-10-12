var answer = false;

if (new LifeCycleUtil().isLifeCycleMigrationActivated()) {
	var checkTables = [];
	var mappedTables = JSON.parse(SNC.CSDMLifeCycleMappingCacheManager.getUniqueTables());
	for (var i = 0; i < mappedTables.length; i++) {
		var tableName = mappedTables[i];
		var tables = new LifeCycleUtil().getParents(tableName, true);
		
		// we want the list of asset tables like alm_asset and cmdb_model from the 
		// unique tables. Logic here to narrow down to that list - those tables dont extend anything
		// so they have only one value in the array returned by getParents - themselves. And exclude cmdb table.
		if (tables.length == 1 && tables[0] != "cmdb") {
			checkTables.push(tableName);
		}
	}

	var refillCmdb = false;
	var refillTables = false;
	var gr = new GlideAggregate('cmdb_ci');
	gr.addNullQuery('life_cycle_stage');
	gr.addNullQuery('life_cycle_stage_status');
	// Need to account for the "All" special CI which is not supposed to be edited. Hence has empty lifecycle fields
	gr.addQuery('sys_id', '!=', '0e7a06157f10310016181ccebefa91ce');
	gr.addAggregate('COUNT');
	gr.query();
	
	if (gr.next() && gr.getAggregate('COUNT') > 0)
		refillCmdb = true;

	if (!refillCmdb && checkTables.length > 0) {
		for (var j = 0; j < checkTables.length; j++) {
			gr = new GlideAggregate(checkTables[j]);
			gr.addNullQuery('life_cycle_stage');
			gr.addNullQuery('life_cycle_stage_status');
			gr.addAggregate('COUNT');
			gr.query();
		
			if (gr.next() && gr.getAggregate('COUNT') > 0) {
				refillTables = true;
				break;
			}
		}
	}

	if (refillCmdb || refillTables) {
		answer = true;
	}
}
	
answer;
	

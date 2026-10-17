answer = JSON.stringify(constructCISourceJSON());

function constructCISourceJSON() {
	var result = {};
	if (!GlideTableDescriptor.isValid('sys_object_source'))
		return result;
	
	if (!GlideTableDescriptor.isValid('cmdb'))
		return result;
	
	// Count of unique tables (CI classes)
	var uniqueTableCount = 0;
	var arrayOfMappings = [];
	
	// Generates the CI class to count mapping
	var gr = new GlideAggregate('sys_object_source');
	gr.addNotNullQuery('target_table');
	gr.addNotNullQuery('target_sys_id');
	gr.addJoinQuery('cmdb', 'target_sys_id', 'sys_id');
	gr.groupBy('target_table');
	gr.addAggregate('count(distinct','target_sys_id');
	gr.query();
	while(gr.next()) {
		arrayOfMappings.push({
			ci_class: gr.getValue('target_table'),
			count: parseInt(gr.getAggregate('count(distinct','target_sys_id'))
		});
		uniqueTableCount++;
	}
	
	result['cmdb_data_all_source'] = arrayOfMappings;
	result['count'] = uniqueTableCount;
	return result;
}

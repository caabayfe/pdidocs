answer = getUniqueCIDiscoSource();

function getUniqueCIDiscoSource() {
	var result = {};
	if (!GlideTableDescriptor.isValid('sys_object_source'))
		return result;
	
	if (!GlideTableDescriptor.isValid('cmdb'))
		return result;
	
	// Count of total CI's found
	var totalCICount = 0;
	
	// Generates the total unique CI count.
	// It is possible for a CI to belong to two different tables/classes; this
	// query counts unique CI sys_id
	var gr = new GlideAggregate('sys_object_source');
	gr.addNotNullQuery('target_table');
	gr.addNotNullQuery('target_sys_id');
	gr.addQuery('id', 'Discovery');
	gr.addJoinQuery('cmdb', 'target_sys_id', 'sys_id');
	gr.addAggregate('count(distinct','target_sys_id');
	gr.setGroup(false);
	gr.query();
	if (gr.next())
		totalCICount = parseInt(gr.getAggregate('count(distinct','target_sys_id'));
	
	return totalCICount;
}

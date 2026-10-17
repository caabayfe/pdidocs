(function refineQuery(current, parent) {

	var usesArrays = [ ],
		gr = new GlideRecord('cmdb_rel_ci');

	gr.addQuery('parent', parent.sys_id);
	gr.addQuery('type.name', 'Uses::Used by');
	gr.addQuery('child.sys_class_name', 'cmdb_ci_storage_server');

	gr.query();
	while (gr.next())
		usesArrays.push('' + gr.child);

	current.addQuery('sys_id', usesArrays);

})(current, parent);

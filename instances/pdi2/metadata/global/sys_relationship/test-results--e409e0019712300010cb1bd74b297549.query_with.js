if (parent.test_with) {
	// make an array of the computers we're going to get test results from...
	var computers = ('' + parent.test_with).split(',');
	var gr = new GlideRecord('cmdb_running_process');
	gr.addQuery('absent', false);
	gr.addQuery('computer', computers);
	gr.query();

	// find running processes that meet the conditions
	var filter = new SNC.Filter('' + parent.condition, 'title');
	var sys_ids = [];
	while (gr.next()) {
		if (filter && filter.match(gr, true)) {
			var sysid = '' + gr.sys_id;
			sys_ids.push(sysid);
		}
	}		
	current.addQuery('sys_id', sys_ids);
}

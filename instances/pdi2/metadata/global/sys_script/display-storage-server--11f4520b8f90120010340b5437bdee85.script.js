(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('cmdb_rel_ci');

	gr.addQuery('parent', current.sys_id);
	gr.addQuery('type.name', 'Uses::Used by');
	gr.addQuery('child.sys_class_name', 'cmdb_ci_storage_server');

	gr.query();
	if (!gr.next()) {
		if (typeof g_scratchpad.hideRelatedLists === 'undefined') // expected
			g_scratchpad.hideRelatedLists = [];

		g_scratchpad.hideRelatedLists.push('REL:d9b3dac78f90120010340b5437bdee47'); 
	}

})(current, previous);

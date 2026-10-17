(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_api_access_policy');
	gr.addQuery('active', current.active);
	gr.addQuery('api_path', current.api_path);
	gr.addQuery('version', current.version);
	gr.addQuery('http_method', current.http_method);
	gr.addQuery('api_resource', current.api_resource);
	gr.addQuery('apply_all_methods', current.apply_all_methods);
	gr.addQuery('apply_all_versions', current.apply_all_versions);
	gr.addQuery('apply_all_resources', current.apply_all_resources);
	gr.addQuery('apply_global', current.apply_global);
	gr.addQuery('apply_all', current.apply_all);
    gr.addQuery('apply_all_tables', current.apply_all_tables);

	if (!current.apply_all_tables) {
        var currentTables = current.api_tablename.split(',');
		
		if (currentTables.length > 0) {
			var qc = gr.addQuery('api_tablename', 'CONTAINS', currentTables[0]);
		}
        
		for (var i = 1; i < currentTables.length; i++) {
            qc.addOrCondition('api_tablename', 'CONTAINS', currentTables[i]);
        }
    }

    gr.query();

	if (gr.next() && (current.active)) {
		gs.addErrorMessage(gs.getMessage('Another TableAPI policy with the same table configuration is active. Duplicate policy id: ' + gr.sys_id));
		current.api_tablename = '';
		current.setAbortAction(true);
	}
        
        
})(current, previous);

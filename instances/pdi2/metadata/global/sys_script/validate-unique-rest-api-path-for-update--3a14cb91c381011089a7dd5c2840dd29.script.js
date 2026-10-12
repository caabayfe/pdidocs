(function executeRule(current, previous /*null when async*/) {

	if (current.api_path != previous.api_path  || 
		current.version != previous.version || 
		current.http_method != previous.http_method || 
		current.api_resource != previous.api_resource ||
		current.apply_all_versions != previous.apply_all_versions ||
		current.apply_all_resources != previous.apply_all_resources ) {

		var gr = new GlideRecord('sys_api_access_scope');
		gr.addQuery('api_path', current.api_path);
		gr.addQuery('version', current.version);
		gr.addQuery('http_method', current.http_method);
		gr.addQuery('api_resource', current.api_resource);
		gr.addQuery('apply_all_versions', current.apply_all_versions);
		gr.addQuery('apply_all_resources', current.apply_all_resources);
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage('Error: duplicated API resources are not allowed.'));
			current.setAbortAction(true);
		}
	}	

})(current, previous);

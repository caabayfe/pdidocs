(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_api_access_scope');
	gr.addQuery('api_path', current.api_path);
	gr.addQuery('version', current.version);
	gr.addQuery('http_method', current.http_method);
	gr.addQuery('api_resource', current.api_resource);
	
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: duplicated API resource found.'));
		current.setAbortAction(true);
	}

})(current, previous);

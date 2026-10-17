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
	gr.query();
	if (gr.next() && (current.active)) {
		gs.addErrorMessage(gs.getMessage('Another policy with the same configuration is active. You can have only one policy active with the same configuration.'));
		current.setAbortAction(true);
	}
})(current, previous);

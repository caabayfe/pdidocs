(function executeRule(current, previous /*null when async*/) {

	var httpMethod = current.http_method;
	var resourcePath = current.api_resource;
	var version = current.version;

	var gr = new GlideRecord('sys_ws_request_spec');
	gr.addQuery("api_resource", resourcePath);
	gr.addQuery("http_method", httpMethod);
	gr.addQuery("version", version);
	gr.query();

	if (gr.next() && gr.sys_id != current.sys_id) {
		gs.addErrorMessage(gs.getMessage('Duplicate entry for unique combination of {0}:{1}:{2}', [httpMethod, GlideStringUtil.escapeHTML(resourcePath), version]));
		current.setAbortAction(true);
	}

})(current, previous);

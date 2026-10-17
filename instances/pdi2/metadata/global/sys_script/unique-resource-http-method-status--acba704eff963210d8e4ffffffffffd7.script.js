(function executeRule(current, previous /*null when async*/) {

	var httpMethod = current.http_method;
	var resourcePath = current.api_resource;
	var httpStatus = current.http_status;
	var version = current.version;

	var gr = new GlideRecord('sys_ws_response_spec');
	gr.addQuery("api_resource", resourcePath);
	gr.addQuery("http_method", httpMethod);
	gr.addQuery("http_status", httpStatus);
	gr.addQuery("version", version);
	gr.query();

	if (gr.next() && gr.sys_id != current.sys_id) {
		gs.addErrorMessage(gs.getMessage('Duplicate entry for unique combination of {0}:{1}:{2}:{3}', [httpMethod, GlideStringUtil.escapeHTML(resourcePath), httpStatus, version]));
		current.setAbortAction(true);
	}

})(current, previous);

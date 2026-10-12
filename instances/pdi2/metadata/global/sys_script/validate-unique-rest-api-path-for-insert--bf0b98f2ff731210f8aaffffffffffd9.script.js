(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_rest_csrf_allow_list');
	gr.addQuery('api_path', current.api_path);
	
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Error: Duplicated API resource found.'));
		current.setAbortAction(true);
	}
})(current, previous);

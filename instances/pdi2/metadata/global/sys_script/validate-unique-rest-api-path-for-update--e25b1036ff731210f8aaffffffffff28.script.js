(function executeRule(current, previous /*null when async*/) {
	if (current.api_path != previous.api_path) {
		var gr = new GlideRecord('sys_rest_csrf_allow_list');
		gr.addQuery('api_path', current.api_path);
		
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage('Error: Duplicated API resources are not allowed.'));
			current.setAbortAction(true);
		}
	}	
})(current, previous);

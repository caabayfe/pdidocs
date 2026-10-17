(function executeRule(current, previous /*null when async*/) {

	var api_key_gr = new GlideRecord('api_key');
	api_key_gr.addQuery('name', current.name);
	api_key_gr.addQuery('source', current.source);
	api_key_gr.addQuery('auth_scope', current.auth_scope);
	api_key_gr.addQuery('user', current.user);
	api_key_gr.addQuery('sys_id', "!=" , current.sys_id);
	api_key_gr.query();

	if(api_key_gr.hasNext()){
		gs.addErrorMessage(gs.getMessage("Duplicate API Key Error Message"));
		current.setAbortAction(true);
	}

})(current, previous);

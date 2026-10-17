(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('provider_user_map');
	gr.addQuery('provider_auth', current.sys_id);
	gr.query();
	gr.deleteMultiple();
	gs.log('ExternalAuth: Deleted all entries of provider_user_map with provider_auth:' + current.sys_id);
})(current, previous);

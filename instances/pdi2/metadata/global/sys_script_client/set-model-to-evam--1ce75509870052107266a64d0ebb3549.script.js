function onLoad() {
	var queryParams = new URLSearchParams(location.search);
	var target = queryParams.get('sysparm_target');
	var sysId = queryParams.get('sys_id');
	if (target == 'sp_ai_search_results_action_config.action_name' && sysId == '-1')
		g_form.setValue('model','035d270073151010c342d5fdbdf6a715'); 
}

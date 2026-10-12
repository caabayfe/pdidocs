(function refineQuery(current, parent) {
	current.addQuery('session', parent.session_id);
	current.addQuery('sys_created_by', parent.impersonated_to.user_name);
	current.addQuery('sys_created_on', '>=', parent.impersonation_start_time);
	if(parent.impersonation_end_time != ""){
		current.addQuery('sys_created_on', '<=', parent.impersonation_end_time);
	}
})(current, parent);

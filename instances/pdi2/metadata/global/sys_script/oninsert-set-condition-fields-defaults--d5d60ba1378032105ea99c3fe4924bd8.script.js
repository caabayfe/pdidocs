(function executeRule(current, previous /*null when async*/) {
	if(current.getValue('read_access') === null)
		current.setValue('read_access', true);
	
	if(current.getValue('required_user_role_names') === null)
		current.setValue('required_user_role_names', "snc_internal");
})(current, previous);

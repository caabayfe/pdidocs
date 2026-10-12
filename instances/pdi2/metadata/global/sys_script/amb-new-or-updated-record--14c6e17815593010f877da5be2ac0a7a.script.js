(function executeRule(current, previous /*null when async*/) {
	
	if ((previous.active == false && current.active == true) || (previous.active == true && current.active == false)) {

		var records = {
			'current_config_name': current.name,
			'current_config_active': current.active,
			'previous_config_name': previous.name,
			'previous_config_active': previous.active,
			'operation': 'config_change',
			'current': current.sys_id,
			'previous': previous.sys_id
		};
		gs.publish('/uxbannerannouncements', records);
	}
	
})(current, previous);

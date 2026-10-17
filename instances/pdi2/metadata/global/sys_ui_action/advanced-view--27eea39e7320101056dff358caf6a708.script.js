	
	if(current.canWrite()) {
		current.update();
	}
	url = current.getTableName() + '.do?sys_id=' + current.sys_id.toString() + '&sysparm_view=advanced&sysparm_view_forced=true';
	action.setRedirectURL(url);

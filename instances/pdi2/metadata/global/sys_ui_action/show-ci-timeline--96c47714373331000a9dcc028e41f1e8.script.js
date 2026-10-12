var view = action.getGlideURI().get('sysparm_view');
	action.setRedirectURL("$ciTimeline.do?sysparm_record=" + current.sys_id + "&sysparm_table=" + current.getTableName() + "&view=" + view + "&sysparm_widget=false&sysparm_drilldown=false&sysparm_stack=no");

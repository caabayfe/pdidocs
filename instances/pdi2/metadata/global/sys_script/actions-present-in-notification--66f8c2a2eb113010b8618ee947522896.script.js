(function executeRule(current, previous /*null when async*/) {

	g_scratchpad.actionsPresentInNotification = false;
	
	//Query if Actions are defined.
	var aggAction = new GlideAggregate('sys_notification_action');
	aggAction.addQuery('notification', current.sys_id);
	aggAction.addAggregate('COUNT');
    aggAction.query();
	
	//Set flag true if Actions are found
    if(aggAction.next() && aggAction.getAggregate('COUNT') > 0){
		g_scratchpad.actionsPresentInNotification = true;
	}

})(current, previous);

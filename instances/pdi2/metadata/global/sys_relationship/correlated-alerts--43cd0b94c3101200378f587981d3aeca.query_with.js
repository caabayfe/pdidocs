//For an alert fined if he is the primary of a group, if so: create a relation to all correlated alerts
(function refineQuery(current, parent) {
		
	var groupId;
	var groupRecored = new GlideRecord('em_agg_group');
	groupRecored.addQuery('primary_alert_id',parent.sys_id);
	groupRecored.query();
	if (groupRecored.next()){
		groupId = groupRecored.sys_id;
		var joinGr = current.addJoinQuery('em_agg_group_alert', 'sys_id', 'alert_id');	
		joinGr.addCondition('group_id', groupId);
		joinGr.addCondition('active', true);

	} else {
		current.addNullQuery("sys_id");
	}	
	
	current.addQuery("state", "!=", "Closed");
	current.addQuery("severity", "!=", "5");
	current.addQuery('maintenance', "false");

})(current, parent);

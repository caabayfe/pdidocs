//For an alert find if he is a secondary of a group, if so: create a relation to all primary alerts
(function refineQuery(current, parent) {
		
	var joinGr = current.addJoinQuery('em_agg_group_alert', 'group', 'group_id');	
	joinGr.addCondition('active', true);
	joinGr.addCondition('alert_id',parent.sys_id);

	current.addQuery("state", "!=", "Closed");
	current.addQuery("severity", "!=", "5");
	current.addQuery('maintenance', "false");	

})(current, parent);

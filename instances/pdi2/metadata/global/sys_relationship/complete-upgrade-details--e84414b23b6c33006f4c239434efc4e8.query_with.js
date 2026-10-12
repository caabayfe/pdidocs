(function refineQuery(current, parent) {
	current.addQuery('upgrade_history', parent.sys_id);
	current.orderBy('mid_server');
	current.orderBy('sys_created_on');

})(current, parent);

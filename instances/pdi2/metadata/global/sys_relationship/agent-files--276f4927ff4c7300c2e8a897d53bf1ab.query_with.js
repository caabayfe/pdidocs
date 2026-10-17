(function refineQuery(current, parent) {

	current.addQuery('mid_server', parent.sys_id);
	current.addQuery('name', 'NOT LIKE', 'agent0.log%');
	current.addQuery('name', '!=', 'wrapper.log');
	current.addQuery('name', 'NOT LIKE', 'dist_upgrade.log%');

})(current, parent);

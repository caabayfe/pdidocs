(function refineQuery(current, parent) {

	current.addQuery('mid_server', parent.sys_id);
	var qc = current.addQuery('name', 'STARTSWITH','agent0.log');
	qc.addOrCondition('name', 'wrapper.log');
	qc.addOrCondition('name', 'STARTSWITH','dist_upgrade.log');

})(current, parent);

(function refineQuery(current, parent) {

	var qc1 = current.addQuery('profile.name', 'System Profile');
	qc1.addOrCondition('profile', parent.sys_id);

})(current, parent);

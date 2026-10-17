(function refineQuery(current, parent) {

	current.addQuery('target', 'preset');
	current.addQuery('type', 'transform');
	current.addQuery('preset', parent.sys_id);

})(current, parent);

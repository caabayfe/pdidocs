(function refineQuery(current, parent) {
	var scope = parent.scope.toString();
	if (scope === 'global') {
		current.addQuery('plugin', 'IN', [scope, parent.sys_id.toString()]);
	} else {
		current.addQuery('plugin', scope);
	}
})(current, parent);

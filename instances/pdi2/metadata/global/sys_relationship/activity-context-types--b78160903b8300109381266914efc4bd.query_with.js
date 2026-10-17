(function refineQuery(current, parent) {
	
	current.addQuery('activity_context', parent.sys_id);
	current.addQuery('module', parent.module);


})(current, parent);

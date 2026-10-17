(function refineQuery(current, parent) {
	
	current.addQuery('model', parent.sys_id);
    current.addQuery('element', '!=', 'context_table');

})(current, parent);

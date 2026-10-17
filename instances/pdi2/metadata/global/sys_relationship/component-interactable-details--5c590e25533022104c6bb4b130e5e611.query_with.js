(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('interaction_id', parent.sys_id);

})(current, parent);

(function refineQuery(current, parent) {
	// Add your code here, such as current.addQuery(field, value);
	current.addActiveQuery();
	current.addQuery('question', parent.sys_id);

})(current, parent);

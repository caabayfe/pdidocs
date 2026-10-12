(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.query('navigation', parent.sys_id);
})(current, parent);

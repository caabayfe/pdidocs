(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('taxonomy',parent.sys_id);
	current.orderByDesc('sys_updated_on');
	

})(current, parent);

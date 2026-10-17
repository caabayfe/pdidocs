(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('taxonomy',parent.sys_id);
	current.addNullQuery('parent_topic');

})(current, parent);

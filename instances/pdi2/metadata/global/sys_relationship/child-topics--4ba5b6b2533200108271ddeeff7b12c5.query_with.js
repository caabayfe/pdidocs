(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('parent_topic',parent.sys_id);
	current.addQuery('taxonomy',parent.taxonomy);

})(current, parent);

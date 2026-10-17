(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('config', parent.getUniqueValue());
	current.addQuery('config_table', parent.getTableName());
})(current, parent);

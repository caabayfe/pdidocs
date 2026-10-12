(function refineQuery(current, parent) {
	current.addQuery('config', parent.getUniqueValue());
	current.addQuery('config_table', parent.getTableName());
	current.addQuery('active', true);
})(current, parent);

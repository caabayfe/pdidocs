(function executeRule(current, previous /*null when async*/) {
	var tableName = current.getValue('name');
	if (!tableName)
		return;

	var marker = new GlideRecord('ts_table_search_usage');
	marker.addQuery('table', tableName);
	marker.deleteMultiple();
})(current, previous);

(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('file_path', parent.file_path);
	current.addQuery('upgrade_history', parent.upgrade_history);

})(current, parent);

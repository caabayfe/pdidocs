(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	current.addQuery('table_name', '!=', 'ds_folder');

})(current, previous);

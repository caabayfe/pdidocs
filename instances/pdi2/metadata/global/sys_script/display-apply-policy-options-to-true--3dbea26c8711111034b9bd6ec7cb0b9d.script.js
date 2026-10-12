(function executeRule(current, previous /*null when async*/) {

	// Applies these values only on new record creation form page
	current.apply_all_methods=true;
	current.apply_all_resources=true;
	current.apply_all_versions=true;
	current.apply_all_tables=true;

})(current, previous);

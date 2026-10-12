(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	var checkbox = current.advanced;
	if(checkbox)
		current.info_fields = '';
	else
		current.info_widget = '';
	
})(current, previous);

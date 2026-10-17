(function executeRule(current, previous) {	
	current.display_name = current.name.toString() + ' - ' + current.version.toString();
})(current, previous);

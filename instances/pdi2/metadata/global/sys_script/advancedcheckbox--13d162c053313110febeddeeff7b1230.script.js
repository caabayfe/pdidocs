(function executeRule(current, previous /*null when async*/) {
	// Add your code here
	var script = current.script;
	if (script.nil() || script.trim().length == 0) {
		current.advanced = false;
	} else {
		current.advanced = true;
	}

})(current, previous);

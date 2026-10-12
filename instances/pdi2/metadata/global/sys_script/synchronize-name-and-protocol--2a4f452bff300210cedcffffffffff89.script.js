(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if (current.protocol)
		current.name = current.protocol;

})(current, previous);

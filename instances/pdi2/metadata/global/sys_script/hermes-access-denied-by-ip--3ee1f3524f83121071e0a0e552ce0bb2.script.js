(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.eventQueue('hermes.ipfilter.access.deny', current);

})(current, previous);

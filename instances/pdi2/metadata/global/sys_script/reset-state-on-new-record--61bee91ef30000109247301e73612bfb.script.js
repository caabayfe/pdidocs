(function executeRule(current, previous /*null when async*/) {

	// reset all state/context
	current.state = 'new';
	current.context = '';
	current.summary = '';

})(current, previous);

(function executeRule(current, previous /*null when async*/) {
	if ( (previous.getValue('state') != current.getValue('state')) && (current.getValue('state') == 'done' || current.getValue('state') == 'error') )
		gs.eventQueue("security.job.status", current, current.getValue('type'), current.getValue('state'));
})(current, previous);

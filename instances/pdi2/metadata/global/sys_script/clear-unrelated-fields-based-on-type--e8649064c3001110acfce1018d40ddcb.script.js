(function executeRule(current, previous /*null when async*/) {
	if(current.type == 'PROCESS' && current.project) {
		current.project = '';
	} 
	else if(current.type == 'PROJECT') {
		if(current.process_def) {
			current.process_def = '';
		}
	}
})(current, previous);

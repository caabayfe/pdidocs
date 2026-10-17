(function executeRule(current, previous /*null when async*/) {
	if(current.source_incident.changes())
		current.source = current.source_incident;
})(current, previous);

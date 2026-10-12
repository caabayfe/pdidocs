(function executeRule(current, previous /*null when async*/) {
	// States to be ignored for versioning
	var IGNORE_STATES = {
		'pending_retirement':true,
		'retired': true,
		'outdated' : true,
	};
	// State that results in a major version
	var MAJOR_VERSION_STATES = {
		'published' : true
	};
	var newState = current.workflow_state+'';
	var prevState = previous.workflow_state+'';
	var v = new KBVersioning();
	
	if(newState===prevState)
		return;
	if(IGNORE_STATES[newState] || IGNORE_STATES[prevState])
		return;
	else if(MAJOR_VERSION_STATES[newState])
		v.incrementMajorVersion(current);
	else
		v.incrementMinorVersion(current);
})(current, previous);

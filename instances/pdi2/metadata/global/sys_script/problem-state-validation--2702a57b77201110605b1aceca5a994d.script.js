(function executeRule(current, previous /*null when async*/) {

	// Reverts the read-only state field in case of invalid updates
	var problemGr = new GlideRecord("problem");
	if (problemGr.get(current.sys_id) && (current.state !== problemGr.state) )
		current.state = problemGr.state;

})(current, previous);

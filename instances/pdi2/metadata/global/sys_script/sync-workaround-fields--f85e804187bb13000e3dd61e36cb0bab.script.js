(function executeRule(current, previous /*null when async*/) {

	var workaround = current.workaround.toString();
	if (workaround.length > 0)
		current.workaround_applied = true;
	else
		current.workaround_applied = false;

})(current, previous);

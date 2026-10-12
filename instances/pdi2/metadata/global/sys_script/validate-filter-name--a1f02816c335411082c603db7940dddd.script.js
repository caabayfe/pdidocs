(function executeRule(current, previous /*null when async*/) {

	if (current.name.startsWith('*') && current.name.endsWith('*'))
		return;

	gs.addErrorMessage('Name must start and end with an asterisk to avoid naming conflicts with the target table');
	current.setAbortAction(true);

})(current, previous);

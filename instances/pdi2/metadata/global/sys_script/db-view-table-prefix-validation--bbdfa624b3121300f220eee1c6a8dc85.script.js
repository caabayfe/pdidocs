(function executeRule(current, previous /*null when async*/) {
	var MAX_LENGTH = 30;

	var prefix = current.variable_prefix.toString();
	if (prefix.length > MAX_LENGTH) {
		current.setAbortAction(true);
		var msg = gs.getMessage('Length of variable prefix {0} is greater than {1}.', [prefix, MAX_LENGTH]);
		current.name.setError(msg);
		gs.addErrorMessage(msg);
	}

})(current, previous);

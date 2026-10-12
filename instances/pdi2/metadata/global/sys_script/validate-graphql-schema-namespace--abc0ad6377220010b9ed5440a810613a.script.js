(function executeRule(current, previous /*null when async*/) {
	var regex = /^[_A-Za-z][_0-9A-Za-z]*$/;
	if (!regex.test(current.namespace)) {
		gs.addErrorMessage("Namespace can start with alphabet or '_' and rest can contain alphanumeric or '_' only");
		current.setAbortAction(true);
		return;
	}
})(current, previous);

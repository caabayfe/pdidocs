(function executeRule(current, previous /*null when async*/) {
	var message = current.getValue("error_message");
	gs.addErrorMessage(message);
})(current, previous);

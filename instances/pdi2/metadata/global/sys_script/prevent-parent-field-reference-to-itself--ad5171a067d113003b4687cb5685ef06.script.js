(function executeRule(current, previous /*null when async*/) {
	if (current.getUniqueValue() === current.getValue("parent")) {
		current.setAbortAction(true);
	}

})(current, previous);

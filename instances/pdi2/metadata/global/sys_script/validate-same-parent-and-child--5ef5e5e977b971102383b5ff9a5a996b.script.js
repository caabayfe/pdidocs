(function executeRule(current, previous /* null when async */) {
	if (current.parent.toString() === current.getUniqueValue()) {
		gs.addErrorMessage(gs.getMessage('Same parent asset cannot be added as child.'));
		current.setAbortAction(true);
	}
}(current, previous));

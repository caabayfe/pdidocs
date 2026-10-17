(function executeRule(current, previous /*null when async*/) {
	var rt = new RecursionTester('data_classification', 'parent');
	if (rt.isRecursive(current)) {
		current.setAbortAction(true);
		current.parent.setError('Invalid Parent');
		gs.addErrorMessage(gs.getMessage('The selected parent introduces a circular reference'));
	}
})(current, previous);

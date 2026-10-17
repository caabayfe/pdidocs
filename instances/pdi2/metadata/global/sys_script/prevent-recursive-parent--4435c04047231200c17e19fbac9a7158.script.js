(function executeRule(current, previous /*null when async*/) {
	
	var recursiveTest = new RecursionTester('sys_update_set', 'parent');
	if (recursiveTest.isRecursive(current)) {
		current.setAbortAction(true);
		current.parent.setError('Invalid Parent');
		gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive update set loop)'));
}

})(current, previous);

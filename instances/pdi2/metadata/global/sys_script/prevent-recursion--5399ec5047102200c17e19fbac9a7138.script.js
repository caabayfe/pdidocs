(function executeRule(current, previous /*null when async*/) {

	//Prevent recursive parent of a sys_atf_test_suite
	var rt = new RecursionTester('sys_atf_test_suite', 'parent');
	if (rt.isRecursive(current)) {
		current.setAbortAction(true);
		current.parent.setError('Invalid Parent');
		gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive test suite loop)'));
	}

})(current, previous);

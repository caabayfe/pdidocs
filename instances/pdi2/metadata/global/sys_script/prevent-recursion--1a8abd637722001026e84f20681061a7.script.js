(function executeRule(current, previous /*null when async*/) {

	//Prevent recursive parent of a scan_check_suite
	var rt = new RecursionTester('scan_check_suite', 'parent');
	if (rt.isRecursive(current)) {
		current.setAbortAction(true);
		current.parent.setError('Invalid Parent');
		gs.addErrorMessage(gs.getMessage('The selected parent loops back to this record (recursive suite loop)'));
	}

})(current, previous);

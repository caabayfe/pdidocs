(function executeRule(current, previous /*null when async*/) {
		current.setValue('state', 2);
		current.setValue('percentage', 100);
	    current.setWorkflow('false');
	    current.update();
})(current, previous);

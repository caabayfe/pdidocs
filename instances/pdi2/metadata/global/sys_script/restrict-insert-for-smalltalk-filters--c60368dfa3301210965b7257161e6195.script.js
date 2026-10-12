(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if(!gs.hasRole('maint')){
		current.setAbortAction(true);
	}

})(current, previous);

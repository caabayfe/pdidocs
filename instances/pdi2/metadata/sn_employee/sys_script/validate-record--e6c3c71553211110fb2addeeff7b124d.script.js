(function executeRule(current, previous /*null when async*/) {
	
	if (gs.getUserName() !== 'system') 
		current.setAbortAction(true);

})(current, previous);

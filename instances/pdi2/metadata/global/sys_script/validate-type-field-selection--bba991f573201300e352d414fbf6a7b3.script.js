(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if(current.type != current.responsibility.type){
		gs.addErrorMessage(gs.getMessage("'Type' field values in Contact and Contact Responsibility do not match. Select same 'Type' at both places"));
		current.setAbortAction(true);
	}

})(current, previous);

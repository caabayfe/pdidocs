(function executeRule(current, previous /*null when async*/) {

	if(current.attrs.fulfiller_role == "") {
		gs.addErrorMessage(gs.getMessage("Please provide Fulfiller Role"));
		current.setAbortAction(true);
	}
	
})(current, previous);

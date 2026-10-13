(function executeRule(current, previous /*null when async*/) {
	//Check if the "Expiration Time" is in the future. Rollback changes and give form error message.
	if (new GlideDateTime().compareTo(new GlideDateTime(current.getValue("expiration_time"))) >= 0){
		gs.addErrorMessage(gs.getMessage('The expiration time must be in the future.'));
		current.setAbortAction(true);
	}	
})(current, previous);

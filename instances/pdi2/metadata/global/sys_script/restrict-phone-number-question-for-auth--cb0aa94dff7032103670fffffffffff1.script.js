(function executeRule(current, previous /*null when async*/) {
	
	if(current.question && current.question.category == 'phone_number') {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Question of category Phone Number cannot be added to service mapping of type authentication"));
	}

})(current, previous);

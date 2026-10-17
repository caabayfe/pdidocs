(function executeRule(current, previous /*null when async*/) {
	var utterance = NLUStudioTrainer.deserialiseUtterance(current.getValue('utterance')).toString();
	
	if ( utterance.length > 200 ) {
		gs.addErrorMessage(gs.getMessage('The utterance must be at most 200 characters long'));
        	current.setAbortAction(true);
	} else if ( utterance.split(" ").length > 25 ) {
		gs.addErrorMessage(gs.getMessage('Maximum number of words allowed in the utterance is 25'));
        	current.setAbortAction(true);
	}

})(current, previous);

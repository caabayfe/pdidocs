(function executeRule(current, previous /*null when async*/ ) {

    if ( current.duration <= 0 ) {
		gs.addErrorMessage(gs.getMessage("Duration has to be a positive number."));
        current.setAbortAction(true);
    }

})(current, previous);

(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Columns must be specified for column pair types"));
	current.setAbortAction(true); 

})(current, previous);

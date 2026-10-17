(function executeRule(current, previous /*null when async*/) {

	if(current.preprocessor == "" || current.postprocessor == "") {
	gs.addErrorMessage(gs.getMessage("Preprocessor and postprocessor scripts are mandatory for advanced capability definitions"));
	
	// Abort the modification
	current.setAbortAction(true);
	}

})(current, previous);

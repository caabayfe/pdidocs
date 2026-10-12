if (current.name.trim() == "") {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('The name of the header footer template cannot be blank'));
}
	

if (previous.name == 'Default') {
	gs.addErrorMessage(gs.getMessage('The default PDF page header footer template cannot be deleted'));
    current.setAbortAction(true);
}

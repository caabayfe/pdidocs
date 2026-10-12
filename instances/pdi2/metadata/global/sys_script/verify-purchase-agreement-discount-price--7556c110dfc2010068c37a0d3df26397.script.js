if ((current.discount < 0) || (current.discount > 99)) {
	gs.addErrorMessage(gs.getMessage('The discount must be between 0 and 99%'));
    current.setAbortAction(true);
}

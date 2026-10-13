if (current.overwrite_template.table != 'em_alert') {
	gs.addErrorMessage(gs.getMessage('The overwrite template has to be defined on the alert table'));
	current.setAbortAction(true);
}

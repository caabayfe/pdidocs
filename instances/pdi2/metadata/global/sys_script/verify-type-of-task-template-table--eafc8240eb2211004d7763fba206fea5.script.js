if (current.incident_template.table != current.type) {
	gs.addErrorMessage(gs.getMessage('The task template has to be defined on the selected type table'));
	current.setAbortAction(true);
}

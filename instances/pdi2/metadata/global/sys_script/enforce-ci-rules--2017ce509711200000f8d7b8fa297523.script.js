if (current.cmdb_ci_class != '') {
	gs.addErrorMessage(gs.getMessage('CI Class should be empty if Asset Class equals "Consumable" or "Software License"'));
	current.setAbortAction(true);
}

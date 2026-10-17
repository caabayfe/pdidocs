(function executeRule(current, previous) {

	var name = current.getValue("name").toLowerCase().trim();
	var templateTable = current.getValue("table");
	var isAdmin = gs.hasRole('admin');

	if (!gs.tableExists(name))
		return;

	if (isAdmin && name !== templateTable) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Table specified does not match the table specified in the name field"));
	}
	else if (!isAdmin) {
		// Non-admin and template name matches existing table, so the change is not allowed
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Template name cannot match an existing table name"));
	}

})(current, previous);

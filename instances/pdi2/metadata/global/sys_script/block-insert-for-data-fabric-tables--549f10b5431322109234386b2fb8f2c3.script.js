(function executeRule(current, previous /*null when async*/) {

	// 1. Skip if not in a UI session.
	if (!gs.getSession().isInteractive())
		return;

	// 2. Skip if not coming from sys_dictionary.do or sys_db_object.do.
	var uri = gs.action.getGlideURI();
	if (!uri)
		return;

	var uriString = uri.toString();
	if (!(uriString.startsWith("sys_dictionary.do") || uriString.startsWith("sys_db_object.do")))
		return;

	// 3. Skip if not a Data Fabric table.
	if (!GlideTableDescriptor.isDataFabricTable(current.name))
		return;

    // It's a Data Fabric table coming from sys_dictionary.do or sys_db_object.do -- block INSERT.
	gs.addErrorMessage(gs.getMessage("sys_dictionary.datafabric.insert.blocked", current.name));
	current.setAbortAction(true);

})(current, previous);

var doDropTable= function() {
	if (current.name.nil()) {
		gs.addInfoMessage('No table name exists. The table name cannot be deleted.');
		gs.print('No table name exists. The table name cannot be deleted.');
		return;
	}

	var has_extensions = GlideDBObjectManager.get().hasExtensions(current.name);
	if (has_extensions) {
		current.setAbortAction(true);
		var exts = GlideDBObjectManager.get().getTableExtensions(current.name);
		gs.addInfoMessage(gs.getMessage('The following tables extend this one: {0} Tables extended by other tables cannot be deleted.', exts));
		return;
	}

	// TODO: disallow deletion if a field from another scope exists

	// delete the table via its sys_db_object
	var deleted = false;
	var table = new GlideRecord('sys_db_object');
	if(table.get('name', current.name.toString()))
		deleted = table.deleteRecord();
	
	// not deleted, then add an error message
	if (!deleted)
		gs.addErrorMessage('The table cannot be deleted.');
}
doDropTable();

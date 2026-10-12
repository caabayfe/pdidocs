processUpdateSetChange();

function processUpdateSetChange() {
	var newUpdateSet = new GlideRecord('sys_update_set');
	newUpdateSet.get(current.update_set);

	if (current.application.nil() && newUpdateSet.application == 'global')
		current.application = 'global';
	if (newUpdateSet.application.scope != current.application.scope) {
		current.update_set = previous.update_set;
		current.setAbortAction(true);
		gs.addErrorMessage("Cannot move update to a set for a different scope");
		return;
	}

	var versions = new GlideRecord('sys_update_version');
	versions.addQuery("name", current.name);
	versions.addQuery("source", previous.update_set);
	versions.addQuery("source_table", "sys_update_set");
	versions.query();

	//Don't use updateMultiple here
	while (versions.next()) {
		versions.setValue("source", current.update_set);
		versions.update();
	}
}

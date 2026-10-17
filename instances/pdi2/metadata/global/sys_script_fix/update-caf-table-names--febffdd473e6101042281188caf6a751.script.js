function updateTableDisplayName(tableName, displayName) {
	var updateConvTask = new GlideRecord('sys_db_object');
	updateConvTask.addQuery('name', tableName);	
	updateConvTask.query();
	if (updateConvTask.next()) {
		updateConvTask.setValue('label', displayName);
		updateConvTask.update();
	}
}

updateTableDisplayName('sys_cs_provider', 'Provider Channel');
updateTableDisplayName('sys_cs_provider_application', 'Provider Channel Identity');

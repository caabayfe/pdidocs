if (!pm.isZboot()) {
	gs.print("Update notifications label for sys_user_delegate");
	updateNotificationLabel('sys_user_delegate');
}

function updateNotificationLabel(tableName) {
	if(!GlideTableDescriptor.isValid(tableName))
		return;
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'notifications');
	gr.addQuery('column_label', 'CC Notifications');
	gr.query();
	if (gr.next()) {
		gr.setValue('column_label', 'All notifications');
		gr.setWorkflow(false);
		gr.update();
	}
	gr = new GlideRecord('sys_documentation');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'notifications');
	gr.addQuery('language', 'en');
	gr.addQuery('label', 'CC Notifications');
	gr.query();
	if (gr.next()) {
		gr.setValue('label', 'All notifications');
		gr.setValue('plural', 'All notifications');
		gr.setWorkflow(false);
		gr.update();
	}
}

function updateRecipientFieldLabel(tableName) {
	if(!GlideTableDescriptor.isValid(tableName))
		return;

	gr = new GlideRecord('sys_documentation');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'recipient_fields');
	gr.addQuery('language', 'en');
	gr.addQuery('label', 'Users in fields');
	gr.query();
	if (gr.next()) {
		gr.setValue('label', 'Recipients in fields');
		gr.setValue('plural', 'Recipients in fields');
		gr.update();
	}

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'recipient_fields');
	gr.addQuery('column_label', 'Users in fields');
	gr.query();
	if (gr.next()) {
		gr.setValue('column_label', 'Recipients in fields');
		gr.update();
	}
}

if(!pm.isZboot())
updateRecipientFieldLabel('sys_notification');

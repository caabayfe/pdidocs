function updateSendByDefaultFieldLabel(tableName) {
	if(!GlideTableDescriptor.isValid(tableName))
		return;

	var gr = new GlideRecord('sys_documentation');
	gr.addQuery('name', tableName);
	gr.addQuery('element', 'send_by_default');
	gr.addQuery('language', 'en');
	gr.query();
	if (gr.next()) {
		gr.setValue('label', 'Auto Opt-in');
		gr.setValue('plural', 'Auto Opt-in');
		gr.setValue('hint', 'If checked, the recipient who has not explicitly subscribed/unsubscribed to receive a notification on this destination type will start receiving them.');
		gr.update();
	}

	var grDictionary = new GlideRecord('sys_dictionary');
	grDictionary.addQuery('name', tableName);
	grDictionary.addQuery('element', 'send_by_default');
	grDictionary.addQuery('column_label', 'Send By Default');
	grDictionary.query();
	if (grDictionary.next()) {
		grDictionary.setValue('column_label', 'Auto Opt-in');
		grDictionary.update();
	}
}

if(!pm.isZboot())
updateSendByDefaultFieldLabel('sys_notif_destination_type');

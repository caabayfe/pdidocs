(function() {
	var sysNotifTable = 'sys_notification';
	var notifTriggerTable = 'notification_trigger';
	
	if (!(new GlideRecord(sysNotifTable).isValid()))
		return;

	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'ui_notification_inbox');
	gr.addQuery('element', 'trigger');
	gr.addQuery('reference', notifTriggerTable);
	gr.query();
	
	if (gr.next()) {
		gr.setValue('reference', sysNotifTable);
		gr.update();
	}
})();

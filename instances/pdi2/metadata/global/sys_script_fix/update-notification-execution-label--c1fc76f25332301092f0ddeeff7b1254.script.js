(function() {
	if (pm.isZboot())
		return;

	var dbObject = new GlideRecord('sys_db_object');
	dbObject.addQuery('name', 'sys_notification_execution');
	dbObject.query();
	if (!dbObject.next())
		return;
	
	dbObject.setValue('label', 'Notification Log');
	dbObject.setWorkflow(false);
	dbObject.update();
	
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification_execution');
	doc.addNullQuery('element');
	doc.addQuery('label', 'Notification Execution');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('label', 'Notification Log');
	doc.setValue('plural', 'Notification Logs');
	doc.setWorkflow(false);
	doc.update();

})();

(function() {
	if (pm.isZboot())
		return;

	var dbObject = new GlideRecord('sys_db_object');
	dbObject.addQuery('name', 'sys_notification_execution_log');
	dbObject.query();
	if (!dbObject.next())
		return;
	
	dbObject.setValue('label', 'Execution Log');
	dbObject.setWorkflow(false);
	dbObject.update();
	
	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification_execution_log');
	doc.addNullQuery('element');
	doc.addQuery('label', 'Sys Notification Execution Log');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('label', 'Execution Log');
	doc.setValue('plural', 'Execution Logs');
	doc.setWorkflow(false);
	doc.update();

})();

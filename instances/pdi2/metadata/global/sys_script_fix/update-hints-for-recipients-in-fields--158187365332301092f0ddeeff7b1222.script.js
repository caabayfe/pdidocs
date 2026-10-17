(function() {
	if (pm.isZboot())
		return;

	var doc = new GlideRecord('sys_documentation');
	doc.addQuery('name', 'sys_notification');
	doc.addQuery('element','recipient_fields');
	doc.addQuery('hint', 'Field in the currently-selected table that contains a reference to a user that will receive an email notification');
	doc.query();
	if (!doc.next())
		return;
	
	doc.setValue('hint', 'Field in the currently-selected table that contains a reference to a user that will receive a notification');
	doc.setWorkflow(false);
	doc.update();

})();

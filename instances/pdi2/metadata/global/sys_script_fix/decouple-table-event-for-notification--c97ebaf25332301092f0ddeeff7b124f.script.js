(function() {
	if (pm.isZboot())
		return;

	var dbObject = new GlideRecord('sys_dictionary');
	dbObject.addQuery('name', 'sys_notification');
	dbObject.addQuery('element','event');
	dbObject.query();
	if (!dbObject.next())
		return;
	dbObject.setValue('reference_qual', '');
	dbObject.setWorkflow(false);
	dbObject.update();

})();

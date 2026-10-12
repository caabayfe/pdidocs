gs.log("Checking attribute value of ar_intent", "Issue Auto Resolution");
var intentGr = new GlideRecord('sys_schema_attribute_m2m');
intentGr.addQuery('schema.column_label', 'Auto-Resolution intent');
intentGr.addQuery('attribute', 'f330f130b3030300f7d1a13816a8dc13');
intentGr.query();

if (intentGr.next()) {
	intentGr.setValue('value', 'new AutoResolutionIntentChoiceListBuilder().getSupportedIntents(current.ar_configuration.sys_id);');
	intentGr.update();

	//Only want to run once after upgrade, then deactivate
	var jobGr = new GlideRecord('sysauto');
	jobGr.addQuery('name', 'Issue Auto Resolution Custom Intent');
	jobGr.query();

	if (jobGr.next()) {
		jobGr.setValue('active', 'false');
		jobGr.update();
	}
}

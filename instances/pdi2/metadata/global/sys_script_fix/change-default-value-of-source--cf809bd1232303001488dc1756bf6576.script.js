var dictGR = new GlideRecord('sys_dictionary');
dictGR.addQuery('name', 'cmn_schedule_condition');
dictGR.addQuery('element', 'applies_to');
dictGR.query();

if (dictGR.next() && (!dictGR.getValue('default_value'))) {
	dictGR.setValue('default_value', 'cmdb_ci_service');
	dictGR.update();

	dictGR = new GlideRecord('sys_dictionary');
	dictGR.addQuery('name', 'cmn_schedule_condition');
	dictGR.addQuery('element', 'source');
	dictGR.query();

	if (dictGR.next()) {
		dictGR.setValue('default_value', 'cmdb_ci_service');
		dictGR.update();
	}
}

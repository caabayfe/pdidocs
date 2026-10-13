var tables = ['discovery_schedule', 'discovery_status'];
tables.forEach(function (table) {
	checkChoice(table, 'CIs', 'Configuration items', 0);
	checkChoice(table, 'IPs', 'IP addresses', 1);
	checkChoice(table, 'Nets', 'Networks', 2);
});

function checkChoice(table, value, label, sequence, plugin) {
	var gr = new GlideRecord('sys_choice');
	gr.addQuery('name', table);
	gr.addQuery('element', 'discover');
	gr.addQuery('value', value);
	gr.setLimit(1);
	gr.query();

	if (gr.next()) {
		//If we find existing record, make sure sequence is matching/updated accordingly
		if (gr.getValue('sequence') != sequence) {
			gr.setValue('sequence', sequence);
			gr.update();
		}
	} else {
		//If we don't find existing record, create record as needed
		gr.setValue('name', table);
		gr.setValue('element', 'discover');
		gr.setValue('language', 'en');
		gr.setValue('value', value);
		gr.setValue('label', label);
		gr.setValue('sequence', sequence);
		gr.insert();
	}
}

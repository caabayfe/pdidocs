var tables = ['discovery_schedule', 'discovery_status'];
tables.forEach(function (table) {
  updateDefaultDiscoverValue(table);
});

function updateDefaultDiscoverValue(table) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('element', 'discover');
	gr.setLimit(1);
	gr.query();

	if (gr.next()) {
		gr.setValue('default_value', 'javascript:new DiscoverChoiceList().getDefaultValue(\'' + table + '\');');
		gr.update();
	}
}

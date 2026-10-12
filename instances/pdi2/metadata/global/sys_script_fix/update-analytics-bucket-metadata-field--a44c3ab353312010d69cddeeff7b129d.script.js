var table = 'sys_analytics_bucket';
var field = 'bucket_metadata';
var dictEntry = new GlideRecord('sys_dictionary');
dictEntry.addQuery('name', table);
dictEntry.addQuery('element', field);
dictEntry.setLimit(1);
dictEntry.query();
if (dictEntry.next()) {
	dictEntry.setValue('internal_type', 'simple_name_values');
	dictEntry.setValue('column_label', 'Configuration');
	dictEntry.update();
	gs.info('Updated ' + table + ' ' + field + ' label and type');
} else {
	gs.info('Did not find the dictionary record for ' + field + ' in ' + table);
}

var docEntry = new GlideRecord('sys_documentation');
docEntry.addQuery('name', table);
docEntry.addQuery('element', field);
docEntry.addQuery('language', 'en');
docEntry.setLimit(1);
docEntry.query();
if (docEntry.next()) {
	docEntry.setValue('label', 'Configuration');
	docEntry.setValue('plural', 'Configurations');
	docEntry.update();
	gs.info('Updated ' + table + ' ' + field + ' documentation entry');
} else {
	gs.info('Did not find the documentation record for ' + field + ' in ' + table);
}

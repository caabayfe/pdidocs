var dictionaryGR = new GlideRecord('sys_dictionary');
dictionaryGR.addQuery('name', 'discovery_schedule');
dictionaryGR.addQuery('element', 'shazzam_batch_size');
dictionaryGR.addQuery('default_value', '5000');
dictionaryGR.query();

if (dictionaryGR.next()) {
	dictionaryGR.setValue('default_value', '1000');
	dictionaryGR.update();
}

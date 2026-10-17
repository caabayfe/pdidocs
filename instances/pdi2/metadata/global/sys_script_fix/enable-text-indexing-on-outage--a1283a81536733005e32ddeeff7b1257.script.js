var table = 'cmdb_ci_outage';
var column = 'short_description';

var dictionaryRecord = new GlideRecord('sys_dictionary');
dictionaryRecord.setWorkflow(false);
dictionaryRecord.addQuery('name', table);
dictionaryRecord.addQuery('element', '');
dictionaryRecord.query();
if (dictionaryRecord.next() && dictionaryRecord.getValue('text_index') == false) {
	dictionaryRecord.setValue('text_index', true);
	dictionaryRecord.update();

	SNC.DictionaryAttribute.set(table, column, 'ts_weight', 50);
	GlideTextIndexEvent().indexAll(table, '');
}

var dictionaryRecord = new GlideRecord('sys_dictionary');
dictionaryRecord.addQuery('name', 'sys_app_template_dependency_definition');
dictionaryRecord.addQuery('element', 'type');
dictionaryRecord.addQuery('display', 'true');
dictionaryRecord.query();

if (dictionaryRecord.next()) {
	dictionaryRecord.setWorkflow(false);
	dictionaryRecord.setValue('display', 'false');
	dictionaryRecord.update();
}

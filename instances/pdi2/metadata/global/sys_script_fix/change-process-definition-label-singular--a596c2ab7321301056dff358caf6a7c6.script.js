function updateProcessDefinitionLabelToSingular() {
	var tableName = 'sys_pd_process_definition';
	var label = 'Process Definition';
	var pluralLabel = label + 's';
	
	if(!GlideTableDescriptor.isValid(tableName))
		return;

	var docGr = new GlideRecord('sys_documentation');
	docGr.addQuery('name', tableName);
	docGr.addQuery('element', null);
	docGr.query();
	
	if (docGr.next()) {
		docGr.setValue('label', label);
		docGr.setValue('plural', pluralLabel);
		docGr.update();
	}

	var dictGr = new GlideRecord('sys_db_object');
	dictGr.addQuery('name', tableName);
	dictGr.query();
	
	if (dictGr.next()) {
		dictGr.setValue('label', label);
		dictGr.update();
	}
}

if(!pm.isZboot()) {
	gs.log('Changing sys_pd_process label from "Process Definitions" to "Process Definition"');
	updateProcessDefinitionLabelToSingular();
}

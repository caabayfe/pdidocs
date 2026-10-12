renameColumnLabels();

function renameColumnLabels() {
	renameColumnLabel(AutoResolutionConstants.CONFIG_TABLE_NAME, 'target_table_name', 'Target table name', 'Table');
	renameColumnLabel(AutoResolutionConstants.CONTEXT_TABLE_NAME, 'nlu_intent', 'NLU Intent', 'Intent');
}

function renameColumnLabel(tableName, columnName, existingLabel, replaceWith) {
	var sysDictionaryGr = new GlideRecord('sys_dictionary');
	sysDictionaryGr.addQuery('name', tableName);
	sysDictionaryGr.addQuery('element', columnName);
	sysDictionaryGr.addQuery('column_label', existingLabel);
	sysDictionaryGr.query();
	
	if (sysDictionaryGr.next()) {
		sysDictionaryGr.setValue('column_label', replaceWith);
		sysDictionaryGr.update();
		
		gs.info('Replaced the label of column ' + columnName + ' from ' + existingLabel + ' with ' + replaceWith + ' on the table ' + tableName);
	} else {
		gs.warn('Could not replace the label of column ' + columnName + ' from ' + existingLabel + ' with ' + replaceWith + ' on the table ' + tableName);
	}	
}

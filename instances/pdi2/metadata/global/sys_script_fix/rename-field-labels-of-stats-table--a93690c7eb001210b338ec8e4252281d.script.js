renameColumnLabels();

function renameColumnLabels() {
	renameColumnLabel("ais_ingest_datasource_stats", 'state', 'Ingestion State', 'Keyword Ingestion State');
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

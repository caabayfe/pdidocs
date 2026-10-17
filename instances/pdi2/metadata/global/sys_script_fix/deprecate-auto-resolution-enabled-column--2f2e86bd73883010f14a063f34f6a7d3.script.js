changeColumnLabel('sys_cs_topic', 'auto_resolution_enabled');
changeColumnLabel('sys_cb_topic', 'auto_resolution_enabled');

function changeColumnLabel(tableName, columnName) {
	var dictionaryGr = new GlideRecord('sys_dictionary');
	dictionaryGr.addQuery('name', tableName);
	dictionaryGr.addQuery('element', columnName);
	dictionaryGr.query();
	
	if (dictionaryGr.next()) {
		var currentLabel = dictionaryGr.getValue('column_label');
		if (currentLabel && currentLabel.length > 0 && !(currentLabel.indexOf('Deprecated') >= 0)) {
			currentLabel += ' (Deprecated)';
			dictionaryGr.setValue('column_label', currentLabel);
			dictionaryGr.update();
			gs.info('{0} column label has been updated to be deprecated in table {1}.', currentLabel, tableName);
		}
	}
}

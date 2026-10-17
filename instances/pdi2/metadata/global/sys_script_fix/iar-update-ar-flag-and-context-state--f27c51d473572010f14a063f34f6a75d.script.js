executeFix();
changeColumnLabel('sys_cs_auto_resolution_matched_intents', 'topic_enabled_for_auto_resolution');

function executeFix() {
	var contextGa = new GlideAggregate(AutoResolutionConstants.CONTEXT_TABLE_NAME);
	contextGa.addQuery('intent_topic_state', 'intent_with_ar_disabled_topic');
	contextGa.addAggregate('COUNT');
	contextGa.query();
	
	var totalRecords = contextGa.next() ? contextGa.getAggregate('COUNT') : 0;
	
	if (totalRecords > 0) {
	
		gs.info('Updating intent_topic_state on {0} Auto-Resolution context records.', totalRecords);

		var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.addQuery('intent_topic_state', 'intent_with_ar_disabled_topic');
		contextGr.query();

		contextGr.setValue('intent_topic_state', AutoResolutionConstants.INTENT_TOPIC_STATE['NO_MATCHED_TOPIC']);
		contextGr.setValue('reason', AutoResolutionConstants.AR_DISABLED_TOPIC);
		contextGr.updateMultiple();

		gs.info('Successfully updated intent_topic_state and reason on {0} Auto-Resolution context records. ', totalRecords);
	} else {
		gs.info('No records found in Auto-Resolution context table to be updated for auto-resolution disabled intent_topic_state');
	}
}

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

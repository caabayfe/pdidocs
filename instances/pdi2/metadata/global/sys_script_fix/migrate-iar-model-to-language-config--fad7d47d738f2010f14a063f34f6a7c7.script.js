migrate();
changeColumnLabel(AutoResolutionConstants.CONFIG_TABLE_NAME, 'ml_solution_name');
changeColumnLabel(AutoResolutionConstants.CONFIG_TABLE_NAME, 'ml_status_last_updated');
changeColumnLabel(AutoResolutionConstants.CONFIG_TABLE_NAME, 'ml_training_progress');
changeColumnLabel(AutoResolutionConstants.CONFIG_TABLE_NAME, 'ml_training_state');

function migrate() {
	//check if there is any model
	var modelResultObject = {};
	modelResultObject = AutoResolutionUtil.checkIARModelExists();
	
	//This is not expected but worst case scenario
	if (gs.nil(modelResultObject) || Object.keys(modelResultObject).length === 0) {
		gs.warn('Unexpected error occurred during Issue Auto-Resolution migration fix script execution');
		return;
	}
	
	if (!gs.nil(modelResultObject) && !modelResultObject.modelExists) {
		gs.info('No migration required as Issue Auto-Resolution model does not exist.');
		return;
	}
	
	if (AutoResolutionLanguageHelper.checkConfigExistsForLanguageAndSolutionName('en', modelResultObject.solutionName)) {
		gs.info('No migration required as Issue Auto-Resolution Language model already exists.');
		return;
	}
	
	//honor IAR Configuration active flag and copy it over to language configuration active flag	
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.setValue('configuration', modelResultObject.configurationSysId);
	languageConfigGr.setValue('ml_solution_name', modelResultObject.solutionName);
	languageConfigGr.setValue('ml_training_state', modelResultObject.trainingState);
	languageConfigGr.setValue('ml_training_progress', modelResultObject.trainingProgress);
	languageConfigGr.setValue('ml_status_last_updated', modelResultObject.lastUpdate);
	languageConfigGr.setValue('active', modelResultObject.configurationActive);
	languageConfigGr.setValue('training_language', 'en'); //default to english
	languageConfigGr.setValue('latest_trained_version', modelResultObject.latestTrainedVersion);
	languageConfigGr.insert();
	
	gs.info('Successfully migrated Issue Auto-Resolution model {0} to use language configuration', modelResultObject.solutionName);
	
	//Update IAR Configuration table fields
	var autoResConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
	autoResConfigGr.get(modelResultObject.configurationSysId);
	autoResConfigGr.setValue('ml_solution_name', '');
	autoResConfigGr.setValue('ml_training_state', '');
	autoResConfigGr.setValue('ml_training_progress', '');
	autoResConfigGr.setValue('ml_status_last_updated', '');
	autoResConfigGr.setValue('training_language', 'en'); //default to english
	autoResConfigGr.update();
	gs.info('Successfully updated Issue Auto-Resolution Configuration training language to English (en)');
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
			gs.info('{0} column label has been updated to be deprecated in Auto-Resolution Configuration table.', currentLabel);
		}
	}
	
}

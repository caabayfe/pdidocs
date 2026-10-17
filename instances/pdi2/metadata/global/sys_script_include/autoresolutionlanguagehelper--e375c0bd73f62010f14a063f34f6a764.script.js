var AutoResolutionLanguageHelper = Class.create();

	
AutoResolutionLanguageHelper.getOrCreateLanguageConfigGr = function(arConfigSysId, languageCode, capability) {
	var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(arConfigSysId, languageCode, capability);
	if (!gs.nil(languageConfigGr))
		return languageConfigGr;
	else
		return AutoResolutionLanguageHelper.createLanguageConfigRecord(arConfigSysId, languageCode, capability);
};
	
AutoResolutionLanguageHelper.getLanguageConfigRecord = function(arConfigSysId, languageCode, capability) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('training_language', languageCode);
	languageConfigGr.addQuery('capability', capability);
	languageConfigGr.query();
		
	if (languageConfigGr.next())
		return languageConfigGr;
	else
		return '';
};

/**
 * Gets the language configuration record given the solution name.
 * @param {string} arConfigSysId	The sys_id of the auto resolution configuration.
 * @param {string} capability		Capability type (e.g. AgentZero, Workflow, or LanguageX)
 * @param {string} solutionName		Name of the solution.
 * @return {GlideRecord} The record of the language configuration.
 */
AutoResolutionLanguageHelper.getLanguageConfigRecordBySolutionName = function(arConfigSysId, capability, solutionName) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('capability', capability);
	languageConfigGr.addQuery('ml_solution_name', solutionName);
	languageConfigGr.query();
		
	return languageConfigGr.next() ? languageConfigGr : '';
};

/**
 * Gets all the language configuration records given the capability type.
 * @param {string} arConfigSysId	The sys_id of the auto resolution configuration.
 * @param {string} capability		Capability type (e.g. AgentZero, Workflow, or LanguageX)
 * @return {string[]} A list of string names of solutions.
 */
AutoResolutionLanguageHelper.getAllSolutionNamesByCapability = function(arConfigSysId, capability) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('capability', capability);
	languageConfigGr.query();
	
	var solutionNameList = [];
	var arrayUtil = new global.ArrayUtil();
	while (languageConfigGr.next()) {
		// Avoid adding duplicate solution names
		var solutionName = languageConfigGr.getValue("ml_solution_name");
		if(arrayUtil.contains(solutionNameList, solutionName)) {
			continue;
		}
		
		solutionNameList.push(languageConfigGr.getValue("ml_solution_name"));
	}

	return solutionNameList;
};

/**
 *
 * @param arConfigSysId
 * @param languageCode
 * @param capability
 * @param solutionName
 * @returns {GlideRecord}
 */
AutoResolutionLanguageHelper.createLanguageConfigRecord = function(arConfigSysId, languageCode, capability, solutionName) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.newRecord();
	languageConfigGr.setValue(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.setValue('training_language', languageCode);
	languageConfigGr.setValue('capability', capability);
	languageConfigGr.setValue('ml_solution_name', solutionName);
	var languageConfigSysId = languageConfigGr.insert();
	languageConfigGr.get(languageConfigSysId);
	return languageConfigGr;
};
	
AutoResolutionLanguageHelper.isLanguageConfigRecordPresent = function(arConfigSysId) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addNotNullQuery('ml_solution_name');
	languageConfigGr.query();
		
	return languageConfigGr.next();
};

AutoResolutionLanguageHelper.updateLanguageConfigRecord = function(languageConfigGr, resultObj) {
	Object.keys(resultObj).forEach(function(key) {
		languageConfigGr.setValue(key, resultObj[key]);
		languageConfigGr.update();
	});
};

AutoResolutionLanguageHelper.getActiveLanguages = function(arConfigSysId) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addActiveQuery();
	languageConfigGr.query();
	
	var activeLanguageCodes = [];
	while (languageConfigGr.next()) 
		activeLanguageCodes.push(languageConfigGr.getValue('training_language'));
	
	return activeLanguageCodes;
};

AutoResolutionLanguageHelper.getSupportedLanguages = function(arConfigSysId, capability) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addNotNullQuery('training_language');
	if (gs.nil(capability))
		capability = new AutoResolutionMLHelper(arConfigSysId).getCapability();
	languageConfigGr.addQuery("capability", capability);
	languageConfigGr.query();
	
	var languageCodes = [];
	while (languageConfigGr.next()) 
		languageCodes.push(languageConfigGr.getValue('training_language'));
	
	return languageCodes;
};

AutoResolutionLanguageHelper.getLanguageToSolutionMap = function(arConfigSysId) {
	var languageToSolutionMap = {};
	
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addNotNullQuery('training_language');
	languageConfigGr.addNotNullQuery('latest_trained_version');
	languageConfigGr.addActiveQuery();
	languageConfigGr.query();

	while (languageConfigGr.next())
		languageToSolutionMap[languageConfigGr.getValue('training_language')] = languageConfigGr.getValue('ml_solution_name');
	
	return languageToSolutionMap;
};

AutoResolutionLanguageHelper.getSolutionNameForLanguage = function(languageCode, arConfigSysId, capability) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addActiveQuery();
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('training_language', languageCode);
	languageConfigGr.addQuery('capability', capability);
	languageConfigGr.query();
	
	if (languageConfigGr.next())
		return languageConfigGr.getValue('ml_solution_name');
	else
		return '';
};

AutoResolutionLanguageHelper.checkConfigExistsForLanguageAndSolutionName = function(languageCode, solutionName) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery('training_language', languageCode);
	languageConfigGr.addQuery('ml_solution_name', solutionName);
	languageConfigGr.query();
	return languageConfigGr.next();
};
	
AutoResolutionLanguageHelper.setActiveOnTrainedLanguageConfigs = function(arConfigSysId, capability, active) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('capability', capability);
	languageConfigGr.query();

	while(languageConfigGr.next()) {
		// making sure the trained version is a valid number when setting active to true
		if ((active && Number(languageConfigGr.getValue('latest_trained_version')) >= 1) || !active) {
			languageConfigGr.setValue('active', active);
			languageConfigGr.update();
		}
	}
};

/**
 * Get the solution name and version for the active language configuration record
 * @param arConfigSysId
 * @param languageCode
 */
AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguage = function(arConfigSysId, languageCode) {
	var results = {};
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addActiveQuery();
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('training_language', languageCode);
	languageConfigGr.query();

	// we expect only 1 language config record to be active for a language
	if (languageConfigGr.next()) {
		results.solution_name = languageConfigGr.getValue("ml_solution_name");
		results.solution_version = languageConfigGr.getValue("latest_trained_version");
		return results;
	}
	return results;
};

/**
 * Gets solution name and version for a given capability and language
 * @param arConfigSysId
 * @param languageCode
 * @param capability
 * @returns {*}
 */
AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguageWithCapability = function(arConfigSysId, languageCode, capability) {
	var result = {};
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery('training_language', languageCode);
	languageConfigGr.addQuery('capability', capability);
	languageConfigGr.query();

	// we expect only 1 language config record to be for a language with capability
	if (languageConfigGr.next()) {
		result.solution_name = languageConfigGr.getValue("ml_solution_name");
		result.solution_version = languageConfigGr.getValue("latest_trained_version");
		return result;
	}
	return result;
};

AutoResolutionLanguageHelper.setVersionNumberForWorkflowSolution = function(arConfigSysId, solutionName, versionNumber) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, arConfigSysId);
	languageConfigGr.addQuery("capability", AutoResolutionConstants.AGENT_ZERO_WORKFLOW_CAPABILITY);
	languageConfigGr.addQuery("ml_solution_name", solutionName)
	languageConfigGr.query();

	if (languageConfigGr.next()) {
		languageConfigGr.setValue("latest_trained_version", versionNumber);
		languageConfigGr.setValue("tuned", true);
		languageConfigGr.setValue("last_tuned", new GlideDateTime());
		languageConfigGr.update();
	}
};

AutoResolutionLanguageHelper.validConfigExistsForSolutionName = function(solutionName) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery('ml_solution_name', solutionName);
	languageConfigGr.query();
	return languageConfigGr.next();
};

AutoResolutionLanguageHelper.deleteLanguageConfiguration = function(configSysId, capability) {
	var languageConfigGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	languageConfigGr.addQuery(AutoResolutionConstants.CONFIGURATION_FIELD_NAME, configSysId);
	languageConfigGr.addQuery("capability", capability);
	languageConfigGr.query();
	if (languageConfigGr.next()) {
		gs.info("AutoResolutionLanguageHelper: Deleting existing languageX configuration record");
		languageConfigGr.deleteMultiple();
	}
};

var AutoResolutionLanguageXHelper = Class.create();

/**
* Returns an array of the outputs found by the passed service name
*
* @param languageXResult: the result from LanguageX
* @param serviceName : the service name to search with
* @param logger : logger
* @return An array of outputs
*/
AutoResolutionLanguageXHelper.getOutputsByServiceName = function(languageXResult, serviceName, logger) {

	if (gs.nil(languageXResult) || gs.nil(languageXResult.result) || gs.nil(languageXResult.result.length == 0)) {
		logger.error('Invalid languageXResult for the service:{0}  LanguageXResult:{1}', serviceName, JSON.stringify(languageXResult));
		return [];
	}

	var results = languageXResult.result;

	var rtnArr = [];

	for (var i=0; i<results.length; i++) {

		var outputs = results[i].output;
		var found = findOutputByServiceName(outputs, serviceName);
		rtnArr.push(found);
	}

	return rtnArr;
};

/**
* Returns whether LanguageX Stage should execute, by checking if there exists an active language config
* that uses either the LanguageX or Composite capabilities.
* @param {string} configId	The sys_id of the auto resolution configuration
* @return {boolean} Whether LanguageX should execute
*/
AutoResolutionLanguageXHelper.shouldLanguageXExecute = function(configId) {
	var encodedQuery = 'active=true^' + AutoResolutionConstants.LX_ENCODED_QUERY + '^OR' + AutoResolutionConstants.COMPOSITE_ENCODED_QUERY;
	return AutoResolutionUtil.checkSolutionWithCapabilityExists(configId, encodedQuery);
};

/**
* Returns whether LanguageX Stage can execute, by checking if the task's session language is an active
* and supported language.
* @param {string} configId	The sys_id of the auto resolution configuration
* @param {string} taskLanguageCode	The task's session language, denoted by a two-letter language code
* @return {boolean} Whether LanguageX should execute
*/
AutoResolutionLanguageXHelper.canLanguageXExecute = function(configId, taskLanguageCode, capability) {
	// LanguageX cannot execute if the task's session language is not supported
	if (!AutoResolutionTaskHelper.taskCreatedInSupportedSessionLanguage(configId, taskLanguageCode, capability))
		return false;

	// A language config using the trained language must be active for LanguageX to be able to execute
	var trainedLanguageCodes = AutoResolutionLanguageHelper.getActiveLanguages(configId);
	if (!gs.nil(trainedLanguageCodes) && trainedLanguageCodes.length > 0)
		return trainedLanguageCodes.indexOf(taskLanguageCode) >= 0;
};

/**
* Returns the output found by the serviceName
*/
function findOutputByServiceName (outputs, serviceName) {

	for (var i=0; i<outputs.length; i++) {

		var output = outputs[i];
		if (output.service == serviceName)
			return output;
	}
	// if not found, return an empty block
	return {};
}

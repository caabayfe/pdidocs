
      var AutoResolutionAPI = Class.create();
AutoResolutionAPI.HR_CORE_CASE_TABLE = "sn_hr_core_case";
AutoResolutionAPI.DISABLE_SELF_TUNING_PROPERTY = "glide.platform_ml.disable_agent_zero_self_tuning";
/*
* @param options = {
    "tableName" : "incident",
    "sysId" : "zzzzzzzz";
  }	
  OR
  @param options = {
    "taskGr": current
  }	
  OR
  @param options = {
    "taskGr": taskGr
  }	
* 
* @returns {"status":"","reason":"","iar_enabled":""}
*/	
AutoResolutionAPI.invokeIAR = function(options) {
	var result = {};
	var tableName = options['tableName'] || '';
	var sysId = options['sysId'] || '';
	var taskGr = options['taskGr'] || '';
	
	var logger = createLogger(sysId, tableName, taskGr);
	
	//check global flag 
	var isAREnabled = gs.getProperty(AutoResolutionConstants.GLOBAL_AUTO_RESOLUTION_PROPERTY) === 'true';		
	if (!isAREnabled) {
		logger.debug(AutoResolutionConstants.GLOBAL_FLAG_DISABLED_MSG);
		return constructFailureResponse(AutoResolutionConstants.GLOBAL_FLAG_DISABLED_MSG, false);
	}
	
	var sysIdProvided = false;
		
	if (gs.nil(tableName) && gs.nil(sysId) && gs.nil(taskGr)) {
		logger.debug(AutoResolutionConstants.INVALID_SYSID_TABLENAME_MSG);
		return constructFailureResponse(AutoResolutionConstants.INVALID_SYSID_TABLENAME_MSG, true);
	}
	
	if (!gs.nil(tableName) && !gs.nil(sysId)) {
		sysIdProvided = true;
		//validate its a task table
		if (!AutoResolutionAPIHelper.validateTaskTable(tableName)) {
			logger.debug(AutoResolutionConstants.NOT_A_TASKGR_MSG);
			return constructFailureResponse(AutoResolutionConstants.NOT_A_TASKGR_MSG, true);
		}
		
		//construct taskGr
		taskGr = AutoResolutionTaskDataBroker.getTaskRecord(tableName, sysId);
		if (gs.nil(taskGr)) {
			logger.debug(AutoResolutionConstants.INVALID_SYSID_TABLENAME_MSG);
			return constructFailureResponse(AutoResolutionConstants.INVALID_SYSID_TABLENAME_MSG, true);
		}
	}
		
	if (!sysIdProvided && !taskGr.instanceOf('task')) {
		logger.debug(AutoResolutionConstants.NOT_A_TASKGR_MSG);
		return constructFailureResponse(AutoResolutionConstants.NOT_A_TASKGR_MSG, true);
	}
	else 
		tableName = taskGr.getTableName();	
	
	var configFieldNames = [AutoResolutionConstants.CONFIGURATION_TRIGGER_CONDITION_FIELD_NAME, AutoResolutionConstants.SYSID_FIELD_NAME, AutoResolutionConstants.ACTIVE_FIELD_NAME];
	var configResults = AutoResolutionUtil.getConfigurationFieldValuesForTaskTable(tableName, configFieldNames);
	
	if (Object.keys(configResults).length === 0) {
		logger.debug(AutoResolutionConstants.IAR_CONFIG_NOT_FOUND_MSG, tableName);		
		return constructFailureResponse(replaceMsgParams(AutoResolutionConstants.IAR_CONFIG_NOT_FOUND_MSG, tableName), true);	
	}
	
	if (configResults[AutoResolutionConstants.ACTIVE_FIELD_NAME] !== '1') {
		logger.debug(AutoResolutionConstants.IAR_CONFIG_INACTIVE_MSG, tableName);
		return constructFailureResponse(replaceMsgParams(AutoResolutionConstants.IAR_CONFIG_INACTIVE_MSG, tableName), true);	
	}
	
	//check if the task condition falls in the condition that we have on config
	if (!GlideFilter.checkRecord(taskGr, configResults[AutoResolutionConstants.CONFIGURATION_TRIGGER_CONDITION_FIELD_NAME])) {
		logger.debug(AutoResolutionConstants.IAR_TRIGGER_CONDITION_MISMATCH_MSG);
		return constructFailureResponse(AutoResolutionConstants.IAR_TRIGGER_CONDITION_MISMATCH_MSG, true);
	}
		
	//assign task to bot user and dispatch sysevent
	new AutoResolutionTaskHelper().processTask(taskGr, configResults[AutoResolutionConstants.SYSID_FIELD_NAME]);
		
	return constructSuccessResponse();
};

/**
 * API for Cases Processed by IAR - Get the total number of cases processed by IAR
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} numOfCasesProcessed - integer value
 */
AutoResolutionAPI.getCasesProcessedByIAR = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getCasesProcessedCount(tableName, numOfDays);
};

/**
 * API for Deflectable Cases - Get the total number of cases where deflectable is true
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} numberOfCasesDeflected - integer value
 */
AutoResolutionAPI.getDeflectableCases = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getDeflectableCaseCount(tableName, numOfDays);
};

/**
 * API for Reviewed Cases - Get the total number of cases where solutions have been reviewed by user
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} numberOfCasesReviewed - integer value
 */
AutoResolutionAPI.getCasesReviewedByUser = function (tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getReviewedCaseCount(tableName, numOfDays);
};

/**
 * API for Cases Auto-resolved - Get the total number of cases where the user requested to close the case
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} numberOfCasesResolved - integer value
 */
AutoResolutionAPI.getCasesResolvedByIAR = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getResolvedCaseCount(tableName, numOfDays);
};

/**
 * API for Feedback: Return the total number of positive, negative, and no feedback
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {{negative: number, no_feedback: number, positive: number}}
 */
AutoResolutionAPI.getFeedbackForCases = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return {"positive" : 0, "negative" : 0, "no_feedback" : 0};

	return AutoResolutionAPIHelper.getFeedbackCountForCases(tableName, numOfDays);
};

/**
 * API for Response channels: Number of notifications delivered on each response channels
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {Email: number, SMS: number, "Virtual Agent": number}
 */
AutoResolutionAPI.getNotificationsDeliveredCountPerResponseChannels = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return {"Email" : 0, "SMS" : 0, "Virtual Agent" : 0};

	return AutoResolutionAPIHelper.getNotificationsDeliveredCountForCases(tableName, numOfDays);
};

/**
 * API for Cases with matched intents - Get the number of cases for which intent was found
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} of Cases with intents which had matched topics
 */
AutoResolutionAPI.getCasesWithMatchedIntents = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getMatchedIntentsCaseCount(tableName, numOfDays);
};

/**
 * API for cases with matched search results
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} of Cases with matched search results
 */
AutoResolutionAPI.getCasesWithMatchedSearchResults = function (tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getAISearchResultsCaseCount(tableName, numOfDays);
};

/**
 * API for Case with matched intents and topic is not found
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} of Cases with intents and no matched topics
 */
AutoResolutionAPI.getCasesWithIntentsAndNoTopics = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getMatchedIntentsWithNoTopicsCaseCount(tableName, numOfDays);
};

/**
 * API for number of cases where topic is found and could not be delivered
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} of cases with topics but notification couldn't be delivered
 */
AutoResolutionAPI.getCasesWithTopicFoundAndNotificationNotDelivered = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getMatchedTopicsWithNotificationsNotDeliveredCaseCount(tableName, numOfDays);
};

/**
 * API for Topics matched: Count of unique topics delivered to users
 * @param {string} tableName - Name of the task table that should have a valid IAR config
 * @param {number} numOfDays - Ex: 30, 90 or 120
 * @returns {number} of unique topics that was delivered to users
 */
AutoResolutionAPI.getTopicsMatchedForIAR = function(tableName, numOfDays) {
	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getUniqueTopicsCount(tableName, numOfDays);
};

/**
 * API to Get the total hours saved by IAR
 * @param {string} tableName
 * @param {number} numOfDays
 * @returns {number} (MTTR * number cases auto-closed by IAR)
 */
AutoResolutionAPI.getHoursSavedByIAR = function(tableName, numOfDays) {
	// we support this data point only if it is a HR related case table currently
	if (!AutoResolutionAPI.isHRCaseTable(tableName))
		return 0;

	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getHoursSaved(tableName, numOfDays);
};

/**
 * API to get Total cost saved by IAR
 * @param {string} tableName
 * @param {number} numOfDays
 * @returns {number} (Hours saved * cost)
 */
AutoResolutionAPI.getCostSavedByIAR = function(tableName, numOfDays) {
	// we support this data point only if it is a HR related case table currently
	if (!AutoResolutionAPI.isHRCaseTable(tableName))
		return 0;

	if (!AutoResolutionAPIHelper.validateInputs(tableName, numOfDays))
		return 0;

	return AutoResolutionAPIHelper.getCostSaved(tableName, numOfDays);
};

/**
 * Check if the passed table name is a HR case table or extends HR case table
 * @param {string} tableName
 */
AutoResolutionAPI.isHRCaseTable = function(tableName) {
	if (tableName === AutoResolutionAPI.HR_CORE_CASE_TABLE)
		return true;

	var tableList = GlideDBObjectManager.get().getTableExtensions(AutoResolutionAPI.HR_CORE_CASE_TABLE);
	return (tableList.indexOf(tableName) >= 0);
}

/**
 * Sets the value of Disable self tuning property for agent zero
 * @param propertyValue true|false
 */
AutoResolutionAPI.disableSelfTuningProperty = function(propertyValue) {
	gs.setProperty(AutoResolutionAPI.DISABLE_SELF_TUNING_PROPERTY, propertyValue);
};

/**
 * Returns an array af active response channels for a given IAR configuration
 * @param configSysId
 * @returns {responseChannel1, ..}
 */
AutoResolutionAPI.getActiveResponseChannels = function(configSysId) {
	return AutoResolutionAPIHelper.getActiveResponseChannelsByConfiguration(configSysId);
};

/**
 * Given the table name, checks whether a trained workflow solution is available in IAR, if true returns the workflow
 * solution name
 * @param tableName - incident | sn_hr_core_case
 * @param languageCode - 'en' | 'fr' ..
 * @returns {"trained_solution": true, "solution_name":"<if trained_solution is true>>"}
 */
AutoResolutionAPI.isTrainedWorkflowSolutionAvailable = function(tableName, languageCode) {
	var response = {};

	var logger = createLogger();

	// check for valid IAR table name
	var configSysId = AutoResolutionUtil.getConfigurationForTask(tableName);
	if (gs.nil(configSysId)) {
		logger.warn("isTrainedWorkflowSolutionAvailable: Not a valid IAR config table {0}", tableName)
		response.trained_solution = false;
		return response;
	}

	// check if solution record is created in IAR for given language
	var result = AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguageWithCapability(configSysId,
		languageCode || 'en', AutoResolutionConstants.AGENT_ZERO_WORKFLOW_CAPABILITY);
	if (Object.keys(result).length === 0) {
		logger.warn("isTrainedWorkflowSolutionAvailable: language configuration with workflow solution not found for the given " +
			"table: {0} and language: {1}", tableName, languageCode)
		response.trained_solution = false;
		return response;
	}

	var mlHelper = new AutoResolutionMLHelper(configSysId);
	var activeVersionExists = mlHelper.hasActiveVersion(result.solution_name);
	if (!activeVersionExists) {
		logger.warn("isTrainedWorkflowSolutionAvailable: there is no trained workflow solution with name {0}", result.solution_name);
		response.trained_solution = false;
		return response;
	}

	response.trained_solution = true;
	response.solution_name = result.solution_name;
	response.solution_version = result.solution_version;
	return response;
};

/**
 * Given the table name, gets list of active mapped intents from IAR intent to topic map table
 * @param tableName
 * @returns [intent1, intent2, ..]
 */
AutoResolutionAPI.getActiveMappedIntents = function(tableName) {
	var mappedIntents = [];
	var logger = createLogger();

	var configSysId = AutoResolutionUtil.getConfigurationForTask(tableName);
	if (gs.nil(configSysId))
		return mappedIntents;

	var result = AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguageWithCapability(configSysId,
		'en', AutoResolutionConstants.AGENT_ZERO_WORKFLOW_CAPABILITY);
	if (Object.keys(result).length === 0) {
		logger.warn("getActiveMappedIntents: there is no workflow solution for given table: {0}, unable to return active intents",
			tableName);
		return mappedIntents;
	}

	var mlHelper = new AutoResolutionMLHelper(configSysId);
	var activeVersionExists = mlHelper.hasActiveVersion(result.solution_name);
	if (!activeVersionExists) {
		logger.warn("getActiveMappedIntents: there is no trained workflow solution with name {0}, unable to return active intents", result.solution_name);
		return mappedIntents;
	}

	var intentTopicMapGr = new GlideRecord(AutoResolutionConstants.INTENT_TOPIC_MAP_TABLE_NAME);
	intentTopicMapGr.addQuery('ar_configuration.target_table_name', tableName);
	intentTopicMapGr.addActiveQuery();
	intentTopicMapGr.query();

	while (intentTopicMapGr.next())
		mappedIntents.push(intentTopicMapGr.getValue("ar_intent"));

	return mappedIntents;
};

/**
 * Updates the active solution version number for the workflow solution associated to the given table name
 * @param tableName
 * @param versionNumber
 * @param languageCode
 * @returns {boolean}
 */
AutoResolutionAPI.updateActiveSolutionVersionNumber = function(tableName, versionNumber, languageCode) {
	var logger = createLogger();
	var configSysId = AutoResolutionUtil.getConfigurationForTask(tableName);
	if (gs.nil(configSysId)) {
		logger.warn("updateActiveSolutionVersionNumber: Not a valid IAR config table {0}", tableName);
		return false;
	}

	var result = AutoResolutionLanguageHelper.getSolutionNameAndVersionForLanguageWithCapability(configSysId,
		languageCode || 'en', AutoResolutionConstants.AGENT_ZERO_WORKFLOW_CAPABILITY);
	if (Object.keys(result).length === 0) {
		logger.warn("updateActiveSolutionVersionNumber: unable to find solution for given table: {0} and language: {1}",
			tableName, languageCode);
		return false;
	}

	var mlHelper = new AutoResolutionMLHelper(configSysId);
	var activeVersionExists = mlHelper.hasActiveVersion(result.solution_name);
	if (!activeVersionExists) {
		logger.warn("updateActiveSolutionVersionNumber: there is no existing trained version of workflow solution with" +
			" name {0}, unable to update version", result.solution_name);
		return false;
	}

	logger.info("updateActiveSolutionVersionNumber: Current workflow solution version for solution:{0} is {1} " +
		"and updating it to {2}", result.solution_name, result.solution_version, versionNumber);

	AutoResolutionLanguageHelper.setVersionNumberForWorkflowSolution(configSysId, result.solution_name, versionNumber);
	return true;

};

/**
 * Register an event with name sn_cs.iar.workflow.training.complete when an IAR WF solution completes training
 * @param solutionName
 * @param solutionVersion
 */
AutoResolutionAPI.createTrainingCompletedEvent = function(solutionName, solutionVersion) {
	var logger = createLogger();
	if (gs.nil(solutionName) || gs.nil(solutionVersion)) {
		logger.debug("createTrainingCompletedEvent: Solution name:{0} or solution version:{1} is invalid", solutionName,
			solutionVersion)
		return;
	}

	if (!AutoResolutionLanguageHelper.validConfigExistsForSolutionName(solutionName)) {
		logger.debug("createTrainingCompletedEvent: IAR configuration is not available with Solution name:{0} ",
			solutionName, solutionVersion)
		return;
	}

	logger.info("createTrainingCompletedEvent: Registering IAR workflow solution training completed event with solution" +
		"name: {0} and solution version: {1}", solutionName, solutionVersion);
	gs.eventQueue("sn_cs.iar.workflow.training.complete", "", "", solutionName, solutionVersion);

};
	
function constructFailureResponse(reason, iarEnabled) {
	var response = {};
	response.status = 'failure';
	response.reason = reason;
	response.iar_enabled = iarEnabled;
	return response;
}
	
function constructSuccessResponse() {
	var response = {};
	response.status = 'success';
	response.reason = AutoResolutionConstants.IAR_TASK_ASSIGNED_TO_BOT_MSG;
	response.iar_enabled = true;	
	return response;
}

function createLogger(param1, param2, param3) {
	var logUtils = new AutoResolutionLoggingUtils()
		.withName(this.type);

	if (!gs.nil(param1) && !gs.nil(param2))
		logUtils.withTaskValues(param1, param2);
	else if (!gs.nil(param3))
		logUtils.withTaskGr(param3);

	return logUtils.createLogger();
}

function replaceMsgParams(param1, param2) {
	return param1.replace("{0}", param2);
}
function impersonateBotUser(taskGr) {
    var sessionUserId = gs.getUserID();
    var botUserId = AutoResolutionUtil.getBotUserId(taskGr.sys_class_name);
    var shouldImpersonate = botUserId !== sessionUserId;

    if (shouldImpersonate) {
        var gi = new GlideImpersonate();
        this.logger.info("Auto-Resolution impersonating bot user: {0} from user: {1}", botUserId, sessionUserId);
        gi.impersonate(botUserId);
        return sessionUserId;
    }

    return null;
}


function endImpersonation(userId) {
    if (gs.nil(userId))
        return;

    this.logger.info("Auto-Resolution ending bot user impersonation");
    var gi = new GlideImpersonate();
    gi.impersonate(userId);
}

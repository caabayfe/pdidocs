
      var AutoResolutionProcessor = Class.create();
AutoResolutionProcessor.prototype = {

	initialize: function() {
		this.WORKING_ON_TASK_MSG = gs.getMessage("I'm working on this task.");
		this.INTENT_TOPIC_PLEASE_RESPOND_MSG = gs.getMessage("To get immediate assistance on this task, please respond to the notification from the Virtual Agent chat widget.");
		this.RECOMMENDATIONS_PLEASE_RESPOND_MSG = gs.getMessage("We found some recommendations that may speed up the process of resolving your request. Please respond to the notification from the Virtual Agent chat widget.");
		this.NO_TASK_MSG = gs.getMessage('No task record found.');
		this.INVALID_CONFIG = gs.getMessage("Auto-Resolution configuration is invalid, unassigning myself from the task for an agent to pick it up.");
		this.INVALID_CONTEXT = gs.getMessage("Auto-Resolution context is invalid, unassigning myself from the task for an agent to pick it up.");
		this.NOT_ASSIGNED_TO_BOT_USER = gs.getMessage("Task is no longer assigned to bot user.");
		this.UNASSIGN_TASK_MSG = gs.getMessage("An agent can better assist you with this task. I'm unassigning myself from the task for an agent to pick it up.");
		this.taskHelper = new AutoResolutionTaskHelper();
		this.contextHelper = new AutoResolutionContextHelper();
	},

	process: function(taskSysId, taskTableName) {
		var stageSW = new GlideStopWatch();
		var totalSW = new GlideStopWatch();
		totalSW.start();

		var logMessages = [
			'Auto-Resolution Task processing summary',
			'Start time: ' + new GlideDateTime()
		];

		this.LOGGING_UTILS = new AutoResolutionLoggingUtils()
			.withName(this.type)
			.withTaskValues(taskSysId, taskTableName)
			// The next context keys will be filled in dynamically, when available
			.withLanguage('')
			.withContextId('')
			.withConfiguration('');

		this.LOGGER = this.LOGGING_UTILS.createLogger();

		// Perform initial validations and un-assign task if something is not right
		stageSW.start();
		var validationResponse = this._doInitialValidations(taskSysId, taskTableName);
		stageSW.end();
		logMessages.push(this._buildLogMessage("AutoResolutionValidationStage", stageSW));

		// Set values from validation response
		var taskGr = validationResponse.task_gr;
		var contextGr = validationResponse.context_gr;
		var configGr = validationResponse.config_gr;
		var languageCode = validationResponse.language_code;

		if (!validationResponse.validation_passed) {
			this.unassignAndUpdateContext(taskGr, contextGr, validationResponse.reason, validationResponse.reason,
				AutoResolutionConstants.TASK_PROCESSING_STATE.VALIDATION);
			logMessages = this._addEndLogMessages(logMessages, totalSW);
			this.LOGGER.info(logMessages.join('\n'));
			return;
		}

		var taskProcessingStages = [
			new AutoResolutionLanguageXStage(contextGr, configGr, taskGr, languageCode),
			new AutoResolutionExitConditionStage(contextGr, configGr, taskGr, languageCode),
			new AutoResolutionIntentProcessingStage(contextGr, configGr, taskGr, languageCode),
			new AutoResolutionAISearchStage(contextGr, configGr, taskGr, languageCode),
			new AutoResolutionNotificationStage(contextGr, configGr, taskGr, languageCode)
		];

		var loggingContextJSON = this._updateLoggingContext(contextGr.getUniqueValue(), configGr.getUniqueValue(), languageCode);
		var loggingContext = new sn_log.GlideLogContext(loggingContextJSON);
		var contextFieldValueMap = {};
		var contextActive = true;

		try {

			var currentUser = this._impersonateBotUser(taskGr);
			// Iterate and execute all stages
			for (var i=0; i<taskProcessingStages.length; i++) {
				stageSW.start();
				var stage = taskProcessingStages[i];

				this.LOGGER.debug('Executing task processing stage {0} with contextFieldValueMap: {1}', stage.type,
					JSON.stringify(contextFieldValueMap));

				// Execute the stage
				var stageResponse = stage.execute(contextFieldValueMap);

				this.LOGGER.debug('Task processing stage {0} is complete with response: {1}', stage.type,
					JSON.stringify(stageResponse));

				// Merge the context from the stage
				contextFieldValueMap = this._merge(contextFieldValueMap, stageResponse.contextFieldValueMap);

				stageSW.stop();
				logMessages.push(this._buildLogMessage(stage.type, stageSW));

				// Check if the stage is telling us to stop the process
				if (!stageResponse.should_proceed){
					contextFieldValueMap.task_processing_state = stage.getStateValue();
					contextActive = false;
					break;
				}
			}
			this._endImpersonation(currentUser);

		} catch (error) {
			this._endImpersonation(currentUser);
			this.LOGGER.error('Error process task={0} in stage={1} for Auto-Resolution, exception={2}', taskGr.number,
				stage.getStateValue(), error);

			contextActive = false;
			contextFieldValueMap.task_processing_state = stage.getStateValue();
			var reasonMessage = "Unexpected error occurred during " + stage.type;

			if (gs.nil(contextFieldValueMap.reason))
				contextFieldValueMap.reason = reasonMessage;
			else
				contextFieldValueMap.reason = reasonMessage + ',\n' + contextFieldValueMap.reason;
		}
		this._endImpersonation(currentUser);

		contextFieldValueMap.active = contextActive;

		if (contextActive) {
			contextFieldValueMap.task_processing_state = AutoResolutionConstants.TASK_PROCESSING_STATE.PROCESSED;
		} else {
			contextFieldValueMap.sla_state = '';
			contextFieldValueMap.notification_state = '';
		}

		stageSW.start();

		this.contextHelper.updateContext(contextGr.getUniqueValue(), contextFieldValueMap);
		this.LOGGER.info('Updated IAR Context with field values: {0}', JSON.stringify(contextFieldValueMap));
		this.handleTask(taskGr, configGr, contextGr.getUniqueValue(), contextActive, contextFieldValueMap);

		stageSW.stop();
		logMessages.push(this._buildLogMessage("ContextAndTaskUpdate", stageSW));

		logMessages = this._addEndLogMessages(logMessages, totalSW);
		this.LOGGER.info(logMessages.join('\n'));

		// Clear the dynamic logging context
		loggingContext.clear();
	},

	/**
	 * Validate task, IAR configuration, IAR context record exists and task is still assigned to bot user
	 * @param taskSysId
	 * @param taskTableName
	 * @returns {{validation_passed = true/false
	              context_sys_id = <sys Id of the IAR context record>
	              language_code = <session language identified during task creation
	              config_sys_id = <sys Id of the IAR configuration record>}}
	 */
	_doInitialValidations: function(taskSysId, taskTableName) {
		this.LOGGER.debug('Auto-Resolution - Task Processing - Initial Validations');

		var response = {
			validation_passed: false,
			reason: '',
			language_code: '',
			task_gr: null,
			context_gr: null,
			config_gr: null,
		};

		try {
			var contextGr = this.contextHelper.getContextFromTaskSysId(taskSysId);
            if (gs.nil(contextGr)) {
                response.reason = this.INVALID_CONTEXT;
                return response;
            }
            response.context_gr = contextGr;

			var taskGr = this.contextHelper.getTaskDetails(contextGr.getUniqueValue());
			if (gs.nil(taskGr)) {
                response.reason = this.NO_TASK_MSG;
                this.LOGGER.error('Task record not found for sysId {0} in table {1}', taskSysId, taskTableName);
                return response;
            }
            response.task_gr = taskGr;

			// Configuration should be valid and active
			var configGr = this.contextHelper.getConfigurationGr(contextGr);
			if (!configGr || configGr.getValue("active") !== '1') {
				response.reason = this.INVALID_CONFIG;
				return response;
			}
			response.config_gr = configGr;
			var currentUser = this._impersonateBotUser(taskGr);
            var isTaksAssigned = this.taskHelper.isTaskAssignedToBotUser(taskGr);
            this._endImpersonation(currentUser);
            if (!isTaksAssigned) {
                response.reason = this.NOT_ASSIGNED_TO_BOT_USER;
                return response;
            }

			response.language_code = this.contextHelper.getLanguageFromContext(contextGr);
			response.validation_passed = true;

			return response;

		} catch (ex) {
			response.reason = 'Unexpected exception during initial validations of task';
			this.LOGGER.error(response.reason + ': ' + ex);
			return response;
		}
	},

	_addEndLogMessages: function(logMessages, sw) {
		var endGDT = new GlideDateTime();
		logMessages.push(this._buildLogMessage("Total", sw));
		logMessages.push('End time: ' + endGDT);
		return logMessages;
	},

	/**
	 * Un-assign task and set context inactive
	 * @param {GlideRecord} taskGr
	 * @param {GlideRecord} contextGr
	 * @param {string} workNote
	 * @param {string} reason
	 * @param {string} state
	 */
	unassignAndUpdateContext: function(taskGr, contextGr, workNote, reason, state) {
		if (!gs.nil(taskGr))
			this.taskHelper.unassignTask(taskGr, workNote);
		if (!gs.nil(contextGr)) {
			this.contextHelper.setContextInactive(contextGr, reason);
			contextGr.setValue('task_processing_state', state);
			contextGr.update();
		}
		this.LOGGER.error(reason);
	},

	handleTask: function(taskGr, configGr, contextId, contextActive, contextFieldValueMap) {
		if (contextActive) {
			this.LOGGER.debug('Continuing with Auto-Resolution flow: {0}', taskGr.number);
			var vaRespChannelActive = AutoResolutionResponseChannelHelper.checkActiveResponseChannelForConfig(configGr.getUniqueValue(), "Virtual Agent");
			var aisTopicSysId = configGr.getValue('ais_topic');
			
			if (gs.nil(contextFieldValueMap.matched_topic) || !vaRespChannelActive)
				this.taskHelper.setWorkNotesOnTask(taskGr, this.WORKING_ON_TASK_MSG);
			else if (contextFieldValueMap.matched_topic === aisTopicSysId)
				this.taskHelper.setCommentsOnTask(taskGr, this.RECOMMENDATIONS_PLEASE_RESPOND_MSG);
			else
				this.taskHelper.setCommentsOnTask(taskGr, this.INTENT_TOPIC_PLEASE_RESPOND_MSG);
			
		} else {
			this.taskHelper.unassignTask(taskGr, this.UNASSIGN_TASK_MSG, configGr.unresolved_task_template.name);
			this.LOGGER.warn('IAR flow for task={0} was unable to proceed.  See contextId={1}', taskGr.getValue('number'),
				contextId);
		}
	},

	_updateLoggingContext: function(contextId, configId, languageCode) {
		var context = {};
		context[AutoResolutionLoggingUtils.CONTEXT_ID] = contextId;
		context[AutoResolutionLoggingUtils.CONFIGURATION] = configId;
		context[AutoResolutionLoggingUtils.LANGUAGE] = languageCode;
		this.LOGGING_UTILS.withConfiguration(configId);
		this.LOGGING_UTILS.withContextId(contextId);
		this.LOGGING_UTILS.withLanguage(languageCode);
		return context;
	},

	_merge: function(obj1, obj2) {
		for (var attribute in obj2)
			obj1[attribute] = obj2[attribute];
		return obj1;
	},

	_buildLogMessage: function(identifier, sw) {
		return sw + " - " + identifier;
	},

	_impersonateBotUser: function(taskGr) {
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
    },

    _endImpersonation: function(userId) {
        if (gs.nil(userId))
            return;

        this.logger.info("Auto-Resolution ending bot user impersonation");
        var gi = new GlideImpersonate();
        gi.impersonate(userId);
    },

	type: 'AutoResolutionProcessor'
};

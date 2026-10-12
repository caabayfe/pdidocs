
      var AutoResolutionContextHelper = Class.create();
AutoResolutionContextHelper.prototype = {
    
	initialize: function() {
		this.RESOLVED_MSG = gs.getMessage('The user decided to close the issue since the topic resolved the issue.');
		this.RESOLVED_CATALOG_MSG = gs.getMessage('I am closing the task because the user submitted a catalog item and the SLA is breached.');
		this.UNRESOLVED_MSG = gs.getMessage('The user decided to leave the issue open since the topic does not resolve the issue.');
		this.DECLINED_MSG = gs.getMessage('The user declined the notification.');
		this.UNABLE_TO_PROCEED = gs.getMessage('The user accepted the notification, but Auto-Resolution was not able to help resolve the issue.');
		this.GENERAL_UNASSIGN_TASK_MSG = gs.getMessage("Auto-Resolution can't resolve the task and un-assigned the task. The context timed out or the user abandoned the conversation.");
		
		this.RESOLVED = 'resolved';
		this.UNRESOLVED = 'unresolved';
		this.TOPIC_COMPLETED = 'topic_completed';
		this.ERROR = 'error';
		this.DECLINED = 'declined';
		this.CATALOG_TIMEOUT = 'catalog_timeout';
	},
	
	getTaskDetails: function(contextId) {
		var contextGr = this._getContextGr(contextId);
		var taskGr = contextGr.getElement('task').getRefRecord();
		return taskGr;
	},	
	
	getContextDetails: function(contextId) {
		var contextGr;
		var configurationGr;
		var taskId;
		var taskTable;
		var topicId;

		this.LOGGER = new AutoResolutionLoggingUtils()
			.withName(this.type)
			.withContextId(contextId)
			.createLogger();
		
		/*** Context Validation ***/
		var contextValidation = this._validateContext(contextId);
		if (!contextValidation.isValid) 
			return this._createInvalidResponse(contextValidation.validationReason, 'Context validation failed');

		this.LOGGER.debug('Passed context validation for context: {0}', contextId);
		contextGr = contextValidation.contextGr;
		
		/*** Configuartion Validation ***/
		var configurationValidation = this._validateConfiguration(contextGr);
		if (!configurationValidation.isValid)
			return this._createInvalidResponse(configurationValidation.validationReason, 'Configuration validation failed');

		this.LOGGER.debug('Passed configuration validation for context: {0}', contextId);
		configurationGr = configurationValidation.configurationGr;
		
		/*** Topic Validation ***/
		var topicValidation = this._validateTopic(contextGr);
		if (!topicValidation.isValid)
			return this._createInvalidResponse(topicValidation.validationReason, 'Topic validation failed');

		this.LOGGER.debug('Passed topic validation for context: {0}', contextId);
		topicId = topicValidation.topicId;
		
		/*** Task Validation ***/
		var taskValidation = this._validateTask(contextGr, configurationGr);
		if (!taskValidation.isValid)
			return this._createInvalidResponse(taskValidation.validationReason, 'Task validation failed');

		this.LOGGER.debug('Passed task validation for context: {0}', contextId);
		
		taskId = taskValidation.taskId;
		taskTable = taskValidation.taskTable;
		
		// Validation has passed for the Auto Resolution Context and
		// we can continue with the Resolution Topic
		return {
			isValid: true,
			taskId:  taskId,
			taskTable: taskTable,
			topicId: topicId,
			language: contextGr.getValue('task_creation_language_code'),
			configId: configurationGr.getUniqueValue(),
			validationReason: ''
		};
	},
	
	executeTemplate: function(type, contextId, loggingContext, message) {
		this.LOGGER = new AutoResolutionLoggingUtils()
			.withName(this.type)
			.withContext(loggingContext)
			.createLogger();
		var templateFunction;
		
		// If there is some undefined type passed the topic will fail.
		// Lets mark the task and context accordingly
		if (gs.nil(type)) {
			var msg = 'No template type passed to ' + this.type + '.executeTemplate()';
			this.LOGGER.error('No template passed to executeTemplate()');
			this.executeErrorTemplate(contextId);
			throw msg;
		}
		
		switch (type) {
			case this.RESOLVED:
				templateFunction = this.executeTaskResolutionTemplate;
				break;
			case this.UNRESOLVED:
				templateFunction = this.executeUnresolvedTaskTemplate;
				break;
			case this.DECLINED:
				templateFunction = this.executeDeclinedTemplate;
				break;
			case this.TOPIC_COMPLETED:
				templateFunction = this.executeTopicCompletionTemplate;
				break;
			case this.ERROR:
				templateFunction = this.executeErrorTemplate;
				break;
			case this.CATALOG_TIMEOUT:
				templateFunction = this.closeTaskViaCatalogTimeout;
				break;
			default:
				this.LOGGER.error('Invalid template type: {0}', type);
				return false;
		}
		
		this._executeFunctionAsBotUser(templateFunction, contextId, message);
	},
	
	executeTaskResolutionTemplate: function(contextId, message) {
		this._executeTaskResolutionTemplate(contextId, message || this.RESOLVED_MSG);
	},

	closeTaskViaCatalogTimeout: function(contextId, message) {
		this._executeTaskResolutionTemplate(contextId, message || this.RESOLVED_CATALOG_MSG);
	},

	_executeTaskResolutionTemplate: function(contextId, message) {
		var contextGr = this._getContextGr(contextId);
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecordFromContextRecord(contextGr);
		var configurationGr = this.getConfigurationGr(contextGr);
		taskGr.applyTemplate(configurationGr.task_resolution_template.name);
		taskGr.work_notes = message;
		AutoResolutionTaskDataBroker.updateTaskRecord(taskGr);

		this.setTaskResolved(contextGr, true, false);
		this.setActive(contextGr, false, false);
		this.setSlaState(contextGr, AutoResolutionConstants.SLA_STATE.COMPLETED, false);
		contextGr.update();
	},

	executeTopicCompletionTemplate: function(contextId, message) {
		var contextGr = this._getContextGr(contextId);
		var configurationGr = this.getConfigurationGr(contextGr);
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecordFromContextRecord(contextGr);
		var topicGr = contextGr.getElement('matched_topic').getRefRecord();
		taskGr.applyTemplate(configurationGr.topic_completion_template.name);
		taskGr.work_notes = message || gs.getMessage('Auto-Resolution topic "{0}" completed.', topicGr.getValue('name'));
		AutoResolutionTaskDataBroker.updateTaskRecord(taskGr);
	},
	
	executeUnresolvedTaskTemplate: function(contextId, message) {
		this._executeUnresolvedTemplate(contextId, message || this.UNRESOLVED_MSG);
	},
	
	executeDeclinedTemplate: function(contextId, message) {
		this._executeUnresolvedTemplate(contextId, message || this.DECLINED_MSG);
	},
	
	executeErrorTemplate: function(contextId, message) {
		var contextGr = this._getContextGr(contextId);
		var configurationGr = this.getConfigurationGr(contextGr);
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecordFromContextRecord(contextGr);
		new AutoResolutionTaskHelper().unassignTask(taskGr,  message || this.UNABLE_TO_PROCEED, configurationGr.unresolved_task_template.name);
	},
	
	_executeUnresolvedTemplate: function(contextId, msg) {
		var contextGr = this._getContextGr(contextId);
		var configurationGr = this.getConfigurationGr(contextGr);
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecordFromContextRecord(contextGr);
		new AutoResolutionTaskHelper().unassignTask(taskGr, msg, configurationGr.unresolved_task_template.name);
		this.setActive(contextGr, false, false);
		this.setSlaState(contextGr, AutoResolutionConstants.SLA_STATE.CANCELED, false);
		contextGr.update();
	},
	
	setWorkNotesOnTask: function(contextId, workNote) {
		var contextGr = this._getContextGr(contextId);
		var topicGr = contextGr.getElement('matched_topic').getRefRecord();
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecord('task', contextGr.getValue('task'));
		if (gs.nil(workNote))
			workNote = gs.getMessage('Auto-Resolution topic "{0}" started.', topicGr.getValue('name'));
		new AutoResolutionTaskHelper().setWorkNotesOnTask(taskGr, workNote);
	},

	/**
	 * Updates context record with the field value map thats passed as input
	 * @param contextSysId
	 * @param contextFieldValueMap map of {"fieldname":"fieldvalue"}
	 */
	updateContext: function(contextSysId, contextFieldValueMap) {
		var contextGr = new GlideRecord('sys_cs_auto_resolution_context');
		contextGr.get(contextSysId);

		Object.keys(contextFieldValueMap).forEach(function(key) {
			contextGr.setValue(key, contextFieldValueMap[key]);
		});

		contextGr.update();
	},

	/**
	 *
	 * @param configSysId
	 * @param taskSysId
	 * @param languageCode
	 * @returns {GlideRecord}
	 */
	createContext: function(configSysId, taskSysId, languageCode) {
		var contextGr = new GlideRecord('sys_cs_auto_resolution_context');
		contextGr.initialize();
		contextGr.setValue('configuration', configSysId);
		contextGr.setValue('task', taskSysId);
		contextGr.setValue('task_creation_language_code', languageCode);
		contextGr.insert();
		return contextGr;
	},

	updateNotificationResponded: function(contextId, state) {
		var contextGr = this._getContextGr(contextId);
		if (contextGr.isValidRecord()) {
			contextGr.setValue('notification_state', state);
			contextGr.update();
			
			if (state === "accepted")
				this._executeFunctionAsBotUser(this.setWorkNotesOnTask, contextId, "");
		}
	},

	/**
	 * Sets task_resolved, optionally updates
	 * @param {GlideRecord} contextGr
	 * @param {boolean} resolved
	 * @param {boolean} update
	 */
	setTaskResolved: function(contextGr, resolved, update) {
		contextGr.setValue('task_resolved', resolved);
		if (update)
			contextGr.update();
	},

	/**
	 * Sets active, optionally updates
	 * @param {GlideRecord} contextGr
	 * @param {boolean} resolved
	 * @param {boolean} update
	 */
	setActive: function(contextGr, active, update) {
		contextGr.setValue('active', active);
		if (update)
			contextGr.update();
	},

	/**
	 * Sets sla_state, optionally updates
	 * @param {GlideRecord} contextGr
	 * @param {boolean} resolved
	 * @param {boolean} update
	 */
	setSlaState: function(contextGr, state, update) {
		contextGr.setValue('sla_state', state);
		if (update)
			contextGr.update();
	},
	
	setInteraction: function(contextId, interactionId) {
		var contextGr = this._getContextGr(contextId);
		if (contextGr.isValidRecord()) {
			contextGr.setValue('interaction', interactionId);
			contextGr.update();
			
			var interactionGr = new GlideRecord('interaction');
			interactionGr.get(interactionId);
			interactionGr.setValue('auto_resolution', true);
			interactionGr.update();
		}
	},

	/**
	 * Unassign the task from bot user and set context inactive for any or all of these below mentioned cases:
	 * Any Context record that has been in waiting state (user hasn't responded to notification) - sets it to timeout
	 * Any context record that has an abandoned conversation (user has accepted the notification and some run time error has occurred during the conversation)
	 * Any context record that has completed conversation but task hasn't been updated via that conversation
	 */
	processContextErrorsOrTimeoutsOrClosedInteraction: function() {
		var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.addEncodedQuery("notification_state=waiting^NQ" +
			"interaction.state=closed_abandoned^NQ" +
			"notification_stateINaccepted,declined^interaction.state=closed_complete");
		contextGr.addQuery('sys_class_name', AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.addQuery('configuration.use_sla', '0');
		contextGr.addActiveQuery();
		contextGr.query();
		var gdt = new GlideDateTime();
		while (contextGr.next()) {
			if (contextGr.getValue("notification_state") === "waiting") {
				var durationMs = contextGr.configuration.task_sla.dateNumericValue();
				gdt.subtract(durationMs);
				if (contextGr.sys_created_on.getGlideObject().compareTo(gdt) < 0) {
					var contextFieldValueMap = {};
					contextFieldValueMap.notification_state = "timeout";
					contextFieldValueMap.sla_state = "timeout";
					contextFieldValueMap.active = false;
					contextFieldValueMap.reason = this._prepareContextReason(contextGr, "SLA is breached.");
					this.updateContext(contextGr.getUniqueValue(), contextFieldValueMap);
					this._unassignTaskFromContext(contextGr);
				}
			} else {
				this.setContextInactive(contextGr, "User has abandoned the conversation.");
				this._unassignTaskFromContext(contextGr);
			}
		}
	},

	/**
	 * @param {GlideRecord} taskGr
	 * @returns {GlideRecord|null} Context record for task or null
	 */
	getContextFromTask: function(taskGr) {
		var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.addQuery('task', taskGr.getUniqueValue());
		contextGr.addQuery('sys_class_name', AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.query();
		if (contextGr.next())
			return contextGr;
		return null;
	},

	/**
	 * @param {GlideRecord} contextGr
	 * @param {string} reason
	 */
	setContextInactive: function(contextGr, reason) {
		contextGr.setValue('active', false);
		contextGr.setValue('reason', this._prepareContextReason(contextGr, reason));
		contextGr.update();
	},

	/**
	 * @param {String} taskGr sysId
	 * @returns {GlideRecord|null} Context record for task or null
	 */
	getContextFromTaskSysId: function(taskSysId) {
		var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.addQuery('task', taskSysId);
		contextGr.addQuery('sys_class_name', AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.query();
		if (contextGr.next())
			return contextGr;
		return null;
	},

	_prepareContextReason: function(contextGr, reason) {
		if (gs.nil(reason))
			return "";

		var existingReason = contextGr.getValue('reason');
		if (!gs.nil(existingReason) && existingReason.length > 0) {
			reason += "\n";
			reason += existingReason;
		}
		return reason;
	},

	handleCatalogSubmitted: function(contextId) {
		var contextGr = this._getContextGr(contextId);

		// Do nothing if a catalog has already been submitted
		if (contextGr.getValue('catalog_submitted') === '1') {
			new AutoResolutionLoggingUtils()
				.withName(this.type)
				.withContextId(contextId)
				.createLogger()
				.info('Catalog has already been submitted for context: {0}', contextId);
			return;
		}

		this.setCatalogSubmitted(contextGr);
		var configGr = this.getConfigurationGr(contextGr);
		var userGr = contextGr.getElement('notification_user').getRefRecord();
		var notificationHelper = new AutoResolutionNotificationHelper(userGr.getUniqueValue(), userGr.getTableName(), configGr.getUniqueValue());
		var emailNotificationId = configGr.getValue('catalog_submitted_email');
		var smsTemplateGr = notificationHelper.getSMSTemplateFromGR(configGr, 'catalog_sms');
		var taskGr = contextGr.getElement('task').getRefRecord();
		notificationHelper.sendEmailAndSMSNotificationForTask(taskGr, emailNotificationId, smsTemplateGr);
	},

	setCatalogSubmitted: function(contextGr) {
		contextGr.setValue('catalog_submitted', true);
		contextGr.update();
	},

	/**
	 * Gets the session language that is stored on context record during context creation
	 * @param contextGr
	 * @returns {string} language code
	 */
	getLanguageFromContext: function(contextGr) {
		return contextGr.getValue("task_creation_language_code");
	},

	/**
	 * Gets the matched topic name that came from an intent (not AIS)
	 * @param taskSysId
	 * @returns {string} matched topic name
	 */
	getMatchedIntentTopicNameFromTask: function(taskSysId) {
		var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
		contextGr.addQuery("task", taskSysId);
		contextGr.query();

		if (!contextGr.next())
			return "";

		var matchedTopic = contextGr.getValue("matched_topic");

		if (gs.nil(matchedTopic))
			return "";

		var configurationGr = this.getConfigurationGr(contextGr);

		if (!configurationGr.isValidRecord())
			return "";

		if (configurationGr.getValue("ais_topic") == matchedTopic)
			return "";

		return contextGr.matched_topic.name;
	},

	_unassignTaskFromContext: function(contextGr) {
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecordFromContextRecord(contextGr);
		var configurationGr = this.getConfigurationGr(contextGr);
		var templateName = configurationGr.unresolved_task_template.name;
		new AutoResolutionTaskHelper().unassignTask(taskGr, this.GENERAL_UNASSIGN_TASK_MSG, templateName);
	},
	
	_validateContext: function(contextId) {
		var contextGr = this._getContextGr(contextId);
		
		if (!contextGr.isValidRecord())
			return this._createInvalidResponse('Context record is not found: ' + contextId);
		
		if (contextGr.getValue('notification_state') === 'timeout')
			return this._createInvalidResponse('Notification expired');
		
		if (contextGr.getValue('active') === '0') {
			var reason = contextGr.getValue("reason");

			if (!gs.nil(reason))
				return this._createInvalidResponse(reason);

			if (contextGr.getValue("notification_state") === "accepted")
				return this._createInvalidResponse("Notification accepted");

			return this._createInvalidResponse('Context record is not active: ' + contextId);
		}
		
		return {
			isValid: true,
			contextGr: contextGr
		};
	},
	
	_validateConfiguration: function(contextGr) {
		var configurationGr = this.getConfigurationGr(contextGr);
		if (!configurationGr.isValidRecord())
			return this._createInvalidResponse('Configuration record is not found');
		
		return {
			isValid: true,
			configurationGr: configurationGr
		};
	},
	
	_validateTopic: function(contextGr) {
		return {
			isValid: true,
			topicId: this._getTopicId(contextGr)
		};
	},
	
	_validateTask: function(contextGr, configurationGr) {
		var taskGr = contextGr.getElement('task').getRefRecord();

		// Task exists
		if (!taskGr.isValidRecord())
			return this._createInvalidResponse('Task record is not found: ' + taskGr.getUniqueValue());
		
		// Task assigned to Virtual Agent
		if (taskGr.getValue('assigned_to') !== AutoResolutionUtil.getBotUserId(taskGr.sys_class_name))
			return this._createInvalidResponse('Task is not assigned to Virtual Agent');
			
		return {
			isValid: true,
			taskId: taskGr.getUniqueValue(),
			taskTable: taskGr.getTableName(),
		};
	},
	
	_getContextGr: function(contextId) {
		var contextGr = new GlideRecord('sys_cs_auto_resolution_context');
		contextGr.get(contextId);
		return contextGr;
	},
	
	getConfigurationGr: function(contextGr) {
		return contextGr.getElement('configuration').getRefRecord();
	},
	
	_getTopicId: function(contextGr) {
		return contextGr.getValue('matched_topic');
	},
	
	_getTaskId: function(contextGr) {
		return contextGr.getValue('task');
	},
	
	_getTaskTable: function(configurationGr) {
		return configurationGr.getValue('target_table_name');
	},
	
	_getVAUserID: function() {
		var gr = new GlideRecord('sys_user');
		gr.addQuery('user_name', 'virtual.agent');
		gr.query();
		gr.next();
		
		return gr.getUniqueValue();
	},
	
	_createInvalidResponse: function(validationReason, validationMessage) {
		if (!gs.nil(validationMessage))
			this._logError(validationReason, validationMessage);
		
		return {
			isValid: false,
			validationReason: validationReason
		};
	},
	
	/*
	* @param templateFunction - any function to be called
	* @param contextId - IAR context Id
	*/
	_executeFunctionAsBotUser: function(templateFunction, contextId, message) {
		var sessionUserId = gs.getUserID();
		
		var contextGr = this._getContextGr(contextId);
		var taskGr = contextGr.getElement('task').getRefRecord();
		var botUserId = AutoResolutionUtil.getBotUserId(taskGr.sys_class_name);
		var shouldImpersonate = botUserId !== sessionUserId;
		var success = true;
		
		if (shouldImpersonate) {
			var gi = new GlideImpersonate();
			gi.impersonate(botUserId);
		}
		
		try {
			templateFunction.call(this, contextId, message);
		} catch (err) {
			this.LOGGER.error('Error executing template function={0}: {1}', templateFunction.name, err);
			success = false;
		} finally {
			if (shouldImpersonate)
				gi.impersonate(sessionUserId);
		}
		
		return success;
	},
	
	_logError: function(validationReason, validationMessage) {
		var messages = [this.type, validationReason, validationMessage];
		this.LOGGER.error('{0}: {1}', validationMessage, validationReason);
	},
	
	type: 'AutoResolutionContextHelper'
};

var AutoResolutionTaskHelper = Class.create();
AutoResolutionTaskHelper.prototype = {
	initialize: function() {
		this.logger = null;
	},
	
	processTask: function(taskGr, configId) {
		
		var autoResConfigId;
		if (gs.nil(configId))
			autoResConfigId = AutoResolutionUtil.getConfigurationForTask(taskGr.getTableName());
		else
			autoResConfigId = configId;
		
		this._createLogger(autoResConfigId, taskGr);
		this.logger.debug('Processing task for Issue Auto-Resolution: taskId={0}', taskGr.getUniqueValue());

		// TODO: replace this with Language detection API (DT)
		var sessionLanguage = this.getSessionLanguageCode();

		// create context record for the task IAR is working on
		var contextHelper = new AutoResolutionContextHelper();
		var contextGr = contextHelper.createContext(autoResConfigId, taskGr.getUniqueValue(), sessionLanguage);
		var contextSysId = contextGr.getUniqueValue();

		if (this.assignTask(taskGr)) {
			this.logger.debug("Executing AutoResolutionEventDispatcher with values: taskTable={0}, taskId={1}, taskNumber={2}, sessionLanguage={3}, contextId={4}",
				taskGr.sys_class_name, taskGr.sys_id, taskGr.number, sessionLanguage, contextSysId);
			new sn_cs.AutoResolutionEventDispatcher().process(taskGr.sys_class_name, taskGr.sys_id);
		} else {
			this.logger.warn('Issue Auto-Resolution process is not going to be triggered for task {0}', taskGr.number);
			// set context inactive
			contextHelper.setContextInactive(contextGr, "Issue Auto-Resolution process is not going to be triggered for task");
		}
	},
	
	/**
	* taskGr
	* Default value of assign_to is Virtual Agent user for IAR configuration
	* Task assignment template is optional in the IAR configuration
	**/
	assignTask: function(taskGr) {
		var result = AutoResolutionUtil.getAssignToAndPostTaskAssignmentTemplateFromTaskConfig(taskGr.sys_class_name);		
		if (!gs.nil(result) && JSON.stringify(result) !== '{}') {			
			taskGr.assigned_to = result.assign_to;
			var templateName = result.task_assignment_template_name;
			if (!gs.nil(templateName))
				taskGr.applyTemplate(templateName);
			
			// this check is to avoid doing multiple updates if IAR is invoked from a 'before' BR
			if (!taskGr.isNewRecord()) 
				AutoResolutionTaskDataBroker.updateTaskRecord(taskGr);
			
			return true;
		}		
		var logger = this._createLogger('', taskGr);
		logger.warn('Invalid Auto-Resolution configuration for table {0}', taskGr.sys_class_name);
		return false;
	},

	/**
	 * Unassign task and update worknotes, apply template only if the task is assigned to bot user
	 * If a live agent grabs a task that was assigned to VA/bot user we don't update anything on the task
	 * @param taskGr
	 * @param workNotes
	 * @param templateName
	 * @returns {{error: string, status: string}}
	 */
	unassignTask: function(taskGr, workNotes, templateName) {
		var configId = AutoResolutionUtil.getConfigurationForTask(taskGr.getValue('sys_class_name'));
		this._createLogger(configId, taskGr);
		var currentUser = this._impersonateBotUser(taskGr);

		try {
			var taskAssignedToBotUser = this.isTaskAssignedToBotUser(taskGr);

			if (taskAssignedToBotUser)
				taskGr.assigned_to = '';

			// we should leave worknotes only when task is assigned to bot user
			if (taskAssignedToBotUser && !gs.nil(workNotes))
				taskGr.work_notes = workNotes;

			if (taskAssignedToBotUser && !gs.nil(templateName))
				taskGr.applyTemplate(templateName);

			var updateSuccess = AutoResolutionTaskDataBroker.updateTaskRecord(taskGr);
		} catch (error) {
			this.logger.error('Unexpected error un-assigning the bot user from the task: {0}', error);
		} finally {
			this._endImpersonation(currentUser);
		}
		
		if (gs.nil(updateSuccess)) {
			this.logger.error('Unexpected error during task update: not able to unassign bot user and apply template, task={0}, templateName={1}', taskGr.number, templateName);
			return {
				status: "failure",
				error: gs.getMessage("Failed to unassign. Unexpected error during task update.")
			};
		}
		
		return { status: "success", error: ""};
	},

	setWorkNotesOnTask: function(taskGr, workNote) {
		this._setFieldOnTaskAsBotUser(taskGr, "work_notes", workNote);
	},
	
	setCommentsOnTask: function(taskGr, comment) {
		this._setFieldOnTaskAsBotUser(taskGr, "comments", comment);
	},

	associateTaskToInteraction: function(taskTable, taskId, interactionId) {
		var gr = new GlideRecord('interaction_related_record');
		gr.setValue('document_table', taskTable);
		gr.setValue('task', taskId);
		gr.setValue('interaction', interactionId);
		gr.setValue('type', 'task');
		gr.insert();
	},
	
	getSessionLanguageCode: function() {
		return AutoResolutionUtil.getSessionLanguage();
	},

	isTaskAssignedToBotUser: function(taskGr) {
		var botUserId = AutoResolutionUtil.getBotUserId(taskGr.sys_class_name);
		return taskGr.getValue('assigned_to') === botUserId;
	},

	_setFieldOnTaskAsBotUser: function(taskGr, field, value) {
		this._createLogger('', taskGr);
		if (gs.nil(value))
			return;

		var currentUser = this._impersonateBotUser(taskGr);
		taskGr[field] = value;
		AutoResolutionTaskDataBroker.updateTaskRecord(taskGr);
		this._endImpersonation(currentUser);
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

	_createLogger: function(param1, param2, param3) {
		var logUtils = new AutoResolutionLoggingUtils()
			.withName(this.type)
			.withConfiguration();

		if (arguments.length === 2)
			logUtils.withTaskGr(param2);
		else
			logUtils.withTaskValues(param2, param3);

		this.logger = logUtils.createLogger();
	},

	type: 'AutoResolutionTaskHelper'
};

AutoResolutionTaskHelper.taskCreatedInSupportedSessionLanguage = function(arConfigSysId, sessionLanguage, capability) {
	var supportedLanguageCodes = AutoResolutionLanguageHelper.getSupportedLanguages(arConfigSysId, capability);
	if (!gs.nil(supportedLanguageCodes) && supportedLanguageCodes.length > 0) {
		var supported = supportedLanguageCodes.indexOf(String(sessionLanguage)) >= 0;
		this.logger.debug('Language={0} is a supported language: {1}', String(sessionLanguage), supported);
		return supported;
	}
	this.logger.debug('Language={0} is not a supported language', String(sessionLanguage));
	return false;
};

AutoResolutionTaskHelper.getConfigRecord = function(taskGr) {
	var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
	configGr.addQuery('target_table_name', taskGr.getValue('sys_class_name'));
	configGr.addActiveQuery();
	configGr.query();
	if (configGr.next())
		return configGr;

	return null;
};

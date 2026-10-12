
      var AutoResolutionTaskProcessingStage = Class.create();
AutoResolutionTaskProcessingStage.prototype = {

	/**
	 * @typedef {Object} StageResponse
	 * @property {boolean} should_proceed
	 * @property {string} reason Why the flow should not proceed
	 * @property {Object} contextFieldValueMap - Map of field + values to be updated on the context
	 */

	/**
	 * Initializes all the values need for the task processing stages
	 *
	 * @param {GlideRecord} contextGr
	 * @param {GlideRecord} configGr
	 * @param {GlideRecord} taskGr
	 * @param {string} languageCode
	 */
	initialize: function(contextGr, configGr, taskGr, languageCode) {
		this.contextGr = contextGr;
		if (!gs.nil(contextGr))
			this.contextId = contextGr.getUniqueValue();

		this.configGr = configGr;
		if (!gs.nil(configGr))
			this.configId = configGr.getUniqueValue();

		this.taskGr = taskGr;
		if (!gs.nil(taskGr))
			this.taskId = taskGr.getUniqueValue();

		var botUserId = AutoResolutionUtil.getBotUserId(taskGr.getTableName());
		var currentUser = gs.getUserID();
		var gi = new GlideImpersonate();
		gi.impersonate(botUserId);
		this.userId = this.taskGr.getValue(this.configGr.getValue('notification_user'));
		gi.impersonate(currentUser);

		this.languageCode = languageCode;

		this.response = {
			should_proceed: true,
			contextFieldValueMap: {},
		};
	},

	/**
	 * Get the state value to be set on sys_cs_auto_resolution_context
	 *
	 * @return {string} state value for the Task Processing Stage
	 */
	getStateValue: function() {
		throw 'getStateValue() must be implemented by the child class';
	},

	/**
	 * Execute the task processing stage
	 *
	 * @param {object} contextFieldValueMap
	 * @return {StageResponse} - Response object from stage execution
	 */
	execute: function(contextFieldValueMap) {
		throw 'execute() must be implemented by the child class';
	},

	/**
	 * Initializes the contextFieldValue Map and creates a logger
	 *
	 * @param {Object} contextFieldValueMap
	 * @param {string} stageName name for the logger
	 */
	prepare: function(contextFieldValueMap, stageName) {
		this.response.contextFieldValueMap = contextFieldValueMap;
		this.LOGGER = new AutoResolutionLoggingUtils()
			.withName(stageName)
			.withTaskValues(this.taskId, this.taskGr.getTableName())
			.withLanguage(this.languageCode)
			.withContextId(this.contextId)
			.withConfiguration(this.configId)
			.createLogger();
	},

	/**
	 * Sets a name-value pair in response.contextFieldValueMap
	 * @param {string} name
	 * @param {object} value
	 */
	setContextValue: function(name, value) {
		this.response.contextFieldValueMap[name] = value;
	},

	/**
	 * Sets or appends to response.contextFieldValueMap.reason
	 * @param {string} reason
	 */
	setContextReason: function(reason) {
		if (gs.nil(this.response.contextFieldValueMap.reason))
			this.response.contextFieldValueMap.reason = reason;
		else if (!gs.nil(reason))
			this.response.contextFieldValueMap.reason = reason + ',\n' + this.response.contextFieldValueMap.reason;
	},

	/**
	 * Set response.should_proceed to false;
	 */
	setError: function(reason) {
		this.response.should_proceed = false;
		if (!gs.nil(reason))
			this.setContextReason(reason);
	},

	type: 'AutoResolutionTaskProcessingStage'
};

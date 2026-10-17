var AutoResolutionLoggingUtils = Class.create();

AutoResolutionLoggingUtils.TASK_ID = 'taskId';
AutoResolutionLoggingUtils.TASK_TABLE = 'taskTable',
AutoResolutionLoggingUtils.LANGUAGE = 'language',
AutoResolutionLoggingUtils.CONFIGURATION = 'configuration',
AutoResolutionLoggingUtils.SIMULATION = 'simulation',
AutoResolutionLoggingUtils.SIMULATION_CONFIGURATION = 'simulationConfiguration',
AutoResolutionLoggingUtils.CONTEXT_ID = 'context',
AutoResolutionLoggingUtils.TOPIC = 'topicId',

AutoResolutionLoggingUtils.prototype = {

	LOGGER_NAME: "sn_cs.auto_resolution",
	CONTEXT: {
		app: 'CI',
		track: 'Auto-Resolution'
	},

	initialize: function() {
	},

	withName: function(name) {
		this.LOGGER_NAME = [this.LOGGER_NAME, name].join('.');
		return this;
	},

	withTaskGr: function(taskGr) {
		return this.withTaskId(taskGr.getUniqueValue()).withTaskTable(taskGr.getTableName());
	},

	withTaskValues: function(taskId, taskTable) {
		this.CONTEXT[AutoResolutionLoggingUtils.TASK_ID] = taskId;
		this.CONTEXT[AutoResolutionLoggingUtils.TASK_TABLE] = taskTable;
		return this;
	},

	withTaskId: function(taskId) {
		this.CONTEXT[AutoResolutionLoggingUtils.TASK_ID] = taskId;
		return this;
	},

	withTaskTable: function(taskTable) {
		this.CONTEXT[AutoResolutionLoggingUtils.TASK_TABLE] = taskTable;
		return this;
	},

	withLanguage: function(languageCode) {
		this.CONTEXT[AutoResolutionLoggingUtils.LANGUAGE] = languageCode;
		return this;
	},

	withConfiguration: function(configId) {
		this.CONTEXT[AutoResolutionLoggingUtils.CONFIGURATION] = configId;
		return this;
	},

	withContextId: function(contextId) {
		this.CONTEXT[AutoResolutionLoggingUtils.CONTEXT_ID] = contextId;
		return this;
	},

	withTopic: function(topicId){
		this.CONTEXT[AutoResolutionLoggingUtils.TOPIC] = topicId;
		return this;
	},

	withSimulation: function(simulationId) {
		this.CONTEXT[AutoResolutionLoggingUtils.SIMULATION] = simulationId;
		return this;
	},

	withSimulationConfiguration: function(simulationConfiguration) {
		this.CONTEXT[AutoResolutionLoggingUtils.SIMULATION_CONFIGURATION] = simulationConfiguration;
		return this;
	},

	withContext: function(context){
		context = JSON.parse(context);
		for (var key in context)
			this.CONTEXT[key] = context[key];
		return this;
	},

	createLogger: function() {
		return new sn_log.GlideLogger(this.LOGGER_NAME, this.CONTEXT, Object.keys(this.CONTEXT));
	},
	
	type: 'AutoResolutionLoggingUtils'
};

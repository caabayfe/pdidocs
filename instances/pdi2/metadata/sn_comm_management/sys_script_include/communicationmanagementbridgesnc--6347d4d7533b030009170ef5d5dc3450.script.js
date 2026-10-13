var context = this;
var CommunicationManagementBridgeSNC = Class.create();
CommunicationManagementBridgeSNC.prototype = {

	initialize: function() {
		this.commManagementUtil = new CommunicationManagementUtil();
	},

	TABLE: {
		COMM_TASK_HANDLER: 'comm_task_handler'
	},

	COLUMN: {
		TABLE: 'table',
		API_NAME: 'api_name',
		HANDLER_SI: 'handler_si',
		COMM_TASK_TABLE: 'comm_task_table',
		COMM_PLAN_TABLE: 'comm_plan_table'
	},

	TABLE_TYPES: {
		TASK: 'task',
		COMM_TASK: 'comm_task',
		COMM_PLAN: 'comm_plan'
	},

	getTaskTableGivenCommTaskTable: function(recordClassName) {
		var handlerGr = new GlideRecord(this.TABLE.COMM_TASK_HANDLER);
		handlerGr.addQuery(this.COLUMN.COMM_TASK_TABLE, recordClassName);
		handlerGr.query();
		if (handlerGr.next())
			return handlerGr.getValue(this.COLUMN.TABLE);
		return '';
	},

	getTaskTableGivenCommPlanTable: function(recordClassName) {
		var handlerGr = new GlideRecord(this.TABLE.COMM_TASK_HANDLER);
		handlerGr.addQuery(this.COLUMN.COMM_PLAN_TABLE, recordClassName);
		handlerGr.query();
		if (handlerGr.next())
			return handlerGr.getValue(this.COLUMN.TABLE);
		return '';
	},

	/*Method returning specific script include instance for a Comm Task record*/
	getHandlerInstanceByCommTaskTable: function(recordClassName) {
		return this.getHandlerInstance(recordClassName, this.TABLE_TYPES.COMM_TASK);
	},

	/*Method returning specific script include instance for a Comm Plan record*/
	getHandlerInstanceByCommPlanTable: function(recordClassName) {
		return this.getHandlerInstance(recordClassName, this.TABLE_TYPES.COMM_PLAN);
	},

	/*Method returning specific script include instance for a Task record*/
	getHandlerInstance: function(recordClassName, tableType /*Optional comm_task or comm_plan table*/) {
		var handlerGr = new GlideRecord(this.TABLE.COMM_TASK_HANDLER);
		if (!tableType || tableType == this.TABLE_TYPES.TASK)
			handlerGr.addQuery(this.COLUMN.TABLE, recordClassName);
		else if (tableType == this.TABLE_TYPES.COMM_TASK)
			handlerGr.addQuery(this.COLUMN.COMM_TASK_TABLE, recordClassName);
		else if (tableType == this.TABLE_TYPES.COMM_PLAN)
			handlerGr.addQuery(this.COLUMN.COMM_TASK_TABLE, recordClassName);
		handlerGr.query();
		var handlerInstance = new CommunicationManagementDefaultHandlerSNC();
		if (handlerGr.next()) {
			var apiName = handlerGr[this.COLUMN.HANDLER_SI][this.COLUMN.API_NAME] + '';
			handlerInstance = this.commManagementUtil.getScriptInstanceFromApiName(context, apiName);
		}
		return handlerInstance;
	},

	type: 'CommunicationManagementBridgeSNC'
};

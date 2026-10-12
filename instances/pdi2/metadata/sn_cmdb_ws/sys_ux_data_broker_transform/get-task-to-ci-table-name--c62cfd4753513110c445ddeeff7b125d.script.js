function transform(input) {
	var DM = new CMDBWsDMConstants();
	var wrapperFn = function() {

		var taskUiProxy = new CMDBWsDMTaskUIProxy();
		var taskSysId = input.sysId;
		return taskUiProxy.getTaskToCiTableName(taskSysId);
	};

	return new CMDBWsDataBrokerHandler().execute(DM.DM_ERROR_SOURCE, "Get task to ci table name", wrapperFn);
}

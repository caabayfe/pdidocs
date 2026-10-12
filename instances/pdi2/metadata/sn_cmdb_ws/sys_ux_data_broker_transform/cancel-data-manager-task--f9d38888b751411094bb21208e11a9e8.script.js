function transform(input) {
	var wrapperFn = function () {
		var taskIds = input.taskIds;
		var _taskIds = taskIds.split(",");
		for (var i = 0; i < _taskIds.length; i++) {
			var uiProxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
			uiProxy.cancelTask(_taskIds[i]);
		}
	};

	return new CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Cancel data manager task", wrapperFn);
}

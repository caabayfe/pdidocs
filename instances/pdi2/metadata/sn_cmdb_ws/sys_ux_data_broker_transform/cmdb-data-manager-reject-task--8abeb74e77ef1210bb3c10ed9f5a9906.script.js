function transform(input) {

	var wrapperFn = function() {
		var taskSysId = input.taskSysId;
		var workNotes = input.workNotes;

		var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
		proxy.rejectTask(taskSysId, workNotes);
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "DM Task Rejection", wrapperFn);
}

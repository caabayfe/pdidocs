function transform(input) {
	var wrapperFn = function() {
		var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
		return proxy.submitCertificationTask(input.task_id);
	};
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Submit certification task", wrapperFn);
}

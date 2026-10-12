function transform(input) {
	var wrapperFn = function() {
		if (input.document_ids.length) {
			var proxy = new sn_cmdb_ws.CMDBWsDMTaskUIProxy();
			return proxy.getAttributeStatusAndComment(input.task_id, input.document_ids);
		} else {
			return {};
		}
	};
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get certification attribute status from DM", wrapperFn);
}

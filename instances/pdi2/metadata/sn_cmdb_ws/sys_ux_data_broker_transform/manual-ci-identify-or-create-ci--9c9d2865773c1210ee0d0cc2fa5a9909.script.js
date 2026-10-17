function transform(input) {
	var payload = input.payload;
	var action = input.action;
	var appId = input.applicationId;
	var addtlContext = input.addtlContext;
	return {
		result: new sn_cmdb_ws.CMDBWsManualCreateCIService().sendToIRE(payload, action, appId, addtlContext),
		action: action
	};
} 

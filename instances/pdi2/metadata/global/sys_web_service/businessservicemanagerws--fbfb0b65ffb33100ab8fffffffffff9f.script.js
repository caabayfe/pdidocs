try {
	var bsManager = new SNC.BusinessServiceManager();
	var result = true;
	gs.log("Executing BusinessServiceManagerWS: " + request.purpose);
	gs.log("Incoming business service sysId: " + request.svcSysId);
	gs.log("Incoming json string: " + request.jsonStr);
	var params = JSON.parse(request.jsonStr);
	switch(request.purpose) {
		case 'addEntryPoint':
		result = bsManager.addEntryPointWithoutStartDiscovery(request.svcSysId, getGlideRecord(params));
		break;
		case 'attachToGroup':
		result = bsManager.attachToGroup(request.svcSysId, params.bsGroupSysId);
		break;
		case 'addBoundaryEndpoint':
		var comment = params.comment;
		// Deleting the comment parameter from the rest of the parameters after getting it
		delete params.comment;
		result = bsManager.addBoundaryEndpoint(request.svcSysId, getGlideRecord(params), comment);
		break;
		case 'detachAllOtherGroups':
		result = bsManager.detachAllOtherGroups(request.svcSysId, params.bsGroupsSysIds);
		break;
		default:
		result = unknownRequest(request.purpose);
	}
	gs.log("Result is: " + result);
	if (!result)
		throw bsManager.error;
	response.result = result;
}
catch(err){
	response.result = 'BUSINESS_SERVICE_MANAGER_WS_ERROR: ' + err;
}

function unknownRequest(purpose) {
	return 'UNKNOWN_REQUEST: ' + purpose;
}

// SECURITY (DEF0881274): The endpoint added to a business service must be a
// Configuration Item endpoint (cmdb_ci_endpoint or a subclass). Reject any other
// class so a caller cannot use this API to insert arbitrary records (e.g.
// sys_web_service / sys_user / sys_script), which would allow privilege
// escalation and remote code execution.
function getGlideRecord(params) {
	if (!isEndpointClass(params.sys_class_name)) {
		// Do not echo the caller-supplied class name back in the response payload.
		throw 'INVALID_ENDPOINT_CLASS';
	}
	var gr = new GlideRecord(params.sys_class_name);
	gr.initialize();
	for (var key in params) {
		gr.setValue(key, params[key]);
	}
	return gr;
}

function isEndpointClass(className) {
	if (!className)
		return false;
	if (!gs.tableExists(className))
		return false;
	return SNC.ClassModel.isInstanceOf(className, 'cmdb_ci_endpoint');
}

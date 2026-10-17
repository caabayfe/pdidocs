try {
	var api = new CmdbWebApi();
	switch(request.purpose) {
		case 'createOrUpdateCI':
		response.result = api.createOrUpdateCI(request.svcSysId, request.jsonStr);
		break;
		case 'createOrUpdateConnection':
		response.result = api.createOrUpdateConnection(request.svcSysId, request.jsonStr);
		break;
		case 'createRelation':
		response.result = api.createRelation(request.jsonStr);
		break;
		case 'removeCIFromBusinessService':
		response.result = api.removeCIFromBusinessService(request.svcSysId, request.jsonStr);
		break;
		case 'getCIByExample':
		response.result = api.retrieveCIByExample(request.jsonStr);
		break;
		case 'deleteBusinessService':
		response.result = api.deleteBusinessService(request.svcSysId);
		break;
		default:
		unknownRequest(request.purpose);
	}
}
catch(err){
	response.result = 'CMDB_API_WS_ERROR: ' + err;
}

function unknownRequest(purpose) {
	response.result = 'UNKNOWN_REQUEST: ' + purpose;
}

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var resp;
	var stackName = 'default';
	var incidentUtils = new global.IncidentUtilsSNC();
	if(request.pathParams.action === 'get'){
		resp = incidentUtils.getGlideStackURL(stackName);
	} else if(request.pathParams.action === 'add'){
		resp = incidentUtils.setGlideStackURL(request.body.data.url, stackName);
	}
	else if(request.pathParams.action === 'top'){
		resp = incidentUtils.getTopGlideStackURL(stackName);
	}
	return resp;

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var resp;
	var stackName = 'default';
	if(request.pathParams.action === 'get'){
		resp = new SLAUtilSNC().getGlideStackURL(stackName);
	} else if(request.pathParams.action === 'add'){
		resp = new SLAUtilSNC().setGlideStackURL(request.body.data.url, stackName);
	}
	else if(request.pathParams.action === 'top'){
		resp = new SLAUtilSNC().getTopGlideStackURL(stackName);
	}
	return resp;

})(request, response);

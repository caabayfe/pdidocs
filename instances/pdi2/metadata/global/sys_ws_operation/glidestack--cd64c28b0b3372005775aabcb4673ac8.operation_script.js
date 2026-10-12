(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	if(request.pathParams.action == 'get') {
		var stack = gs.getSession().getStack('default');
		return {url: stack.back()};
	}

	return resp;
})(request, response);

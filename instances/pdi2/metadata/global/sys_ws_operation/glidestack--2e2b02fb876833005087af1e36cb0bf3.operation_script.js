(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var stack = gs.getSession().getStack('default');
	if (request.pathParams.action == 'get') {
		return {url: stack.back()};
	}
	else if (request.pathParams.action == 'add') {
		return {url: stack.push(request.body.data.url)};
	}
	else if (request.pathParams.action == 'top') {
		return {url: stack.top()};
	}

    // implement resource here

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var queryParams = request.queryParams;

	var code = queryParams.code[0] || "";
	var state = queryParams.state[0] || "";

	return {
		code: code,
		state: state
	};

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	new IpsUserStateUtils().writeSuppression(request, response);
})(request, response);

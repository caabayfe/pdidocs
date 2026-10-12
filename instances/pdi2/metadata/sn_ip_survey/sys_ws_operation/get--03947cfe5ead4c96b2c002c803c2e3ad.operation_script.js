(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	new IpsUserStateUtils().loadState(request, response);
})(request, response);

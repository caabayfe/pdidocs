(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	return new OCGroup(request.pathParams.group_id)
		.setCheckAccess(true)
		.getMembers(true);
})(request, response);

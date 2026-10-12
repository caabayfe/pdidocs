(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result = {
		exclusionCount: 0,
		preserverCount: 0,
		cleanupScriptCount: 0
	};

	var profileName = String(request.queryParams.profileName);
	result = ProfileUtils.buildConfigCountFromLocalInstance(profileName);

	response.setBody(result);

})(request, response);

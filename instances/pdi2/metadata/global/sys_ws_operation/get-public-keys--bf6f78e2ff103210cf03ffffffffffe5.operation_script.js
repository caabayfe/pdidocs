(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var jwksService = new SNC.OauthJWKSAPI();

	// Generate JWKS Response - returns Stringified json object containing list of JWK obj
	var resultJson = jwksService.buildJWKSResponse();
	var result = JSON.parse(resultJson);

	// Setting up required content type and headers, goal is to keep browser from caching this as of now
	response.setHeader("Cache-Control", "no-cache,no-store,must-revalidate,max-age=-1");
	response.setHeader("Pragma", "no-store,no-cache");
	response.setHeader("Expires","Thu, 01 Jan 1970 00:00:00");
	response.setContentType('application/json');
	var writer = response.getStreamWriter();

	// Sending Response based on result from jwks service
	if (result.success) {
		response.setStatus(200);
		writer.writeString(JSON.stringify(result.data));
	} else {
		// this is error response 
		response.setStatus(result.status);
		var payload = {
			error: result.error
		};
		writer.writeString(JSON.stringify(payload));
	}

})(request, response);

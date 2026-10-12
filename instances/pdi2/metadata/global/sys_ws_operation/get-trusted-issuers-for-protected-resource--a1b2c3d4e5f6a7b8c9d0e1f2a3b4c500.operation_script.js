(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var resourceIdentifier = request.queryParams.resource;
	if (!resourceIdentifier) {
		response.setStatus(400);
		response.setBody({ error: 'invalid_request', message: 'resource query parameter is required' });
		return;
	}

	var result = JSON.parse(new SNC.OAuthServiceAPI().getTrustedIssuers(resourceIdentifier));
	response.setStatus(result.status);

	if (result.success) {
		response.setBody(result.data);
	} else {
		response.setBody({ error: result.error, resource: resourceIdentifier });
	}

})(request, response);

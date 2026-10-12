(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var entryPointParams = JSON.stringify(request.body.data.entryPointParams);
	return (new SNC.BusinessServiceManager()).getEntryPointConnectivity(entryPointParams);
})(request, response);

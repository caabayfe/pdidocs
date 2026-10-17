(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here

	var autoDetectObject = new BenchmarkClientAutoDetectOptInErrors();
	return autoDetectObject.autoDetectErrors();

})(request, response);

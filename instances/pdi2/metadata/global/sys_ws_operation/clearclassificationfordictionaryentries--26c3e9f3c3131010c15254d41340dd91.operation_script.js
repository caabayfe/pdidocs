(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestBody = request.body;
	var requestData = requestBody.data;
	var dict = requestData.dictionary_entries;
	
	return new SNC.DCManager().clearClassification(dict);
})(request, response);

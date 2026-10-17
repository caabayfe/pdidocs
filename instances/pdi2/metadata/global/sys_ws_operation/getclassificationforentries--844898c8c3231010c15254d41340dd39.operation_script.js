(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestBody = request.body;
	var requestData = requestBody.data;
    var dict = requestData.dictionary_entries;
	var result = new SNC.DCManager().getClassification(dict);
	var json = new JSON();
	var responseBody = json.decode(result);
	if(JSUtil.type_of(responseBody) == 'string')
		return result;
	
	response.setBody(responseBody);
})(request, response);

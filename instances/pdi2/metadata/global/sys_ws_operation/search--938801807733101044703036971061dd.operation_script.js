(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var aisaRequest = request.body.data;
	var aisaSearchUtil = new AISASearchUtil();
	var searchResponse = aisaSearchUtil.search(aisaRequest);
	response.setStatus(searchResponse.status); 

	if (searchResponse.status != 200) {
		var myError = new sn_ws_err.ServiceError();
		myError.setStatus(searchResponse.status);
		myError.setMessage(searchResponse.msg);
		response.setError(myError);
	} else {
		response.setBody(searchResponse.data);
	}
})(request, response);

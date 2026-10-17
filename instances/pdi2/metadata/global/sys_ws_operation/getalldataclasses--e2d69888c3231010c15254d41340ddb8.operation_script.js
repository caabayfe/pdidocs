(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var json = new JSON();
	responseBody = json.decode(new SNC.DCManager().getAllDataClasses());
    response.setBody(responseBody);
})(request, response);

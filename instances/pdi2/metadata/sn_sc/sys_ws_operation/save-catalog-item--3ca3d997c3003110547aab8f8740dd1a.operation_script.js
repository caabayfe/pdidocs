(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var response_body = new CatalogSaveUtility().processAddItem(request,response, false); 
	return response_body;

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

 var response_body = new CatalogSaveUtility().processAddItem(request,response, true);
 return response_body;

})(request, response);

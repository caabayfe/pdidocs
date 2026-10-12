(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var util = new CustomMapTokenUtil();
	util.getTokenHandler(process, request, response);
})(request, response);

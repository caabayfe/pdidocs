(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var result = CollabTaskServiceV2.getControllerInfo();
    response.setBody(result.body);
    response.setStatus(result.status);
	
})(request, response);

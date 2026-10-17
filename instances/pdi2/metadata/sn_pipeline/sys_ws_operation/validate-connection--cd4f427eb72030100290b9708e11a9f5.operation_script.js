(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	response.setBody({instanceId: gs.getProperty("instance_id"), isValid: true});
    response.setStatus(200);

})(request, response);

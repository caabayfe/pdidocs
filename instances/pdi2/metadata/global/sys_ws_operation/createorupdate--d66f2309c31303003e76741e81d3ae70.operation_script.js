(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var createOrUpdate = new CreateOrUpdateITService();
	createOrUpdate.process(request, response);

})(request, response);

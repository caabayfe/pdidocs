(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var controller = new sn_tourbuilder.GTAutoLaunchController();
	var name = request.queryParams.name;
	var portal = request.queryParams.portal;
	/*
	@params name, portal, autolaunchPage
	*/
	var tours = controller.getToursForPage(name, portal, true);

	response.setBody(tours);
	response.setStatus(200);

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var controller = new sn_tourbuilder.GTAutoLaunchController();
	var page = request.queryParams.page;
	var portal = request.queryParams.portal;
	var context = request.queryParams.context;
	var tour = controller.getAutoLaunchTour(page, portal, context);

	response.setBody(tour);
	response.setStatus(200);

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var controller = new sn_tourbuilder.GTAutoLaunchController();
	var payload = request.body.data;
	var res = null;
	if (payload.page) {
		res = controller.overrideAllToursForUserInPage(payload.page, payload.portal);
		if (res) {
			response.setBody(res);
			response.setStatus(200);
		} else {
			response.setStatus(400);
		}
	} else if (payload.tour) {
		res = controller.overrideTourForUser(payload.tour);
		if(res) {
			response.setBody();
			response.setStatus(200);
		} else {
			response.setStatus(400);
	    }
	} else {
		response.setStatus(400);
	}

})(request, response);

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var payload = request.body.data;
	var tourController = new sn_tourbuilder.GTAutoLaunchController();
	try{
		var res = tourController.createTour(payload);
		if (res.success) {
			response.setBody(res.payload);
			response.setStatus(200);
		} else {
			response.setStatus(400);
			response.setBody(res.payload ? res.payload : {msg: res.reason});
		}
	} catch(e) {
		response.setStatus(500);
		response.setBody({msg: e.message});
	}

})(request, response);

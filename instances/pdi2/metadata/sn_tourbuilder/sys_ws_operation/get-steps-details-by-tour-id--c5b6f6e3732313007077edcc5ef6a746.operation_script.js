(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var controller = new GTStepsController();
	var tourId = request.pathParams.tour_id;
	
	controller.getTourStepsDetails(tourId, function(err, data) {
		if (err) {			
			response.setBody({msg: data.msg});			
			if(data.status === "BAD_REQUEST")
				response.setStatus(400);
			else if (data.status === "NOT FOUND")
				response.setStatus(404);
		} else {
			response.setBody({data: data.guidedTourStepsDetails});
			response.setStatus(200);
		}
	});

})(request, response);

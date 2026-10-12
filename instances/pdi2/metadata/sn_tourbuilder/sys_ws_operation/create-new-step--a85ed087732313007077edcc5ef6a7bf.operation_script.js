(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var controller = new GTStepsController();
	var tourId = request.pathParams.tour_id;
	var payload = request.body.data;
	
	controller.createNewStep(tourId, payload, function(err, data) {
		if (err) {
			response.setBody({msg: data.msg});
			if(data.status === "BAD_REQUEST")
				response.setStatus(400);
			else if (data.status === "NOT FOUND")
				response.setStatus(404);
			else if (data.status === "FORBIDDEN")
				response.setStatus(403);
			else if (data.status === "INTERNAL_ERROR")
				response.setStatus(500);
			
		} else {
			response.setBody({id: data.id});
			response.setStatus(200);
		}
	});
		
	})(request, response);

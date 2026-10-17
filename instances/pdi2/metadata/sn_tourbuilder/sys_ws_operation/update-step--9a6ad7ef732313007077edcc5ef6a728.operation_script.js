(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	if (!request.pathParams.step_id){
		response.setBody({msg: "Step ID is required"});
		response.setStatus(400);
		return;
	} 
	
	var controller = new GTStepsController();
	var tourId = request.pathParams.tour_id;
	var stepId = request.pathParams.step_id;
	var payload = request.body.data;
	
	controller.updateStep(tourId, stepId, payload, function(err, data) {
		if (err) {			
			response.setBody({msg: data.msg});			
			if(data.status === "BAD_REQUEST")
				response.setStatus(400);
			else if (data.status === "NOT FOUND")
				response.setStatus(404);
			else if(data.status === "INTERNAL_ERROR")
				response.setStatus(500);
		} else {
			response.setBody({id: data.id});
			response.setStatus(200);
		}
	});
	

})(request, response);

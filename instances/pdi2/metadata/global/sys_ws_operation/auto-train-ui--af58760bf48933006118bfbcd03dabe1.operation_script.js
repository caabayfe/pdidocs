(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var params;
	try{
		params = request.body.data;
		gs.info("Training Request API request body params = " +JSON.stringify(params));
	}catch(e){
		gs.error("Error occured " + e.getMessage());
		throw sn_ws_err.BadRequestError("malformed request");
	}
		
	if(params.auto_train == "true"){
		gs.info("Preparing to trigger training requests for OOB solution definitions");
		var count = new MLTriggerAutoTrain().triggerTrainingRequests(params.capability);
		gs.info("Number of training requests triggered: " + count);
		return {
			"message":"Triggered training requests.",
			"count" : count
		};
	}else{
		gs.info("Not triggering training requests");
		return {
			"message":"Unable to trigger training requests. Please check the request parameters.",
			"count" : 0
		};
	}

})(request, response);

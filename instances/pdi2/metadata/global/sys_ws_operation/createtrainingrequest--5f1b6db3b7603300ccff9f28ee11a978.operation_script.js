(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

   var params;
   
	try{
		params = request.body.data;
		gs.info("Training Request API request body params = " +JSON.stringify(params));
	}catch(e){
		gs.error("Error occured " + e.getMessage());
		throw sn_ws_err.BadRequestError("malformed request");
	}
	
	//Check if the user provided solution sys_id exists.
	var solutionDefinition = new GlideRecord("ml_capability_definition_base");
	solutionDefinition.addQuery("sys_id", params.sys_id);
	solutionDefinition.addQuery("solution_label", params.solution_label);
	solutionDefinition.query();
	if (!solutionDefinition.next()){
			throw sn_ws_err.BadRequestError("Sys_id or Solution Label does not exist. Please provide a valid sys_id & solution label.");
	}
	
	try{
		var patt = /^(run_once|every_(30|60|90|120)_days)$/i;
		var train_freq = params.training_frequency;
		var result = train_freq.match(patt);
	}catch(e){
		gs.error("Error occured " + e.getMessage());
		throw sn_ws_err.ServiceError("Error parsing training frequency");
	}
	
	if(result == null){
		gs.warning("Not a valid training frequency");
		throw sn_ws_err.BadRequestError("Please provide a valid training frequency. It should be one of run_once OR every_(N)_days");
	}
	
	try{
		new global.MLRequestSchedule().deleteExistingCapabilityTrainingRequestSchedule(params.sys_id);
		new global.MLRequestSchedule().insertCapabilityTrainingRequestSchedule(params.sys_id, params.solution_label, train_freq);
		return {
			"message":"Triggered training request.",
		};
		
	} catch(e){
		gs.error("Error occured " + e.getMessage());
		throw sn_ws_err.ServiceError("Error creating a training request.");
	}
	

})(request, response);

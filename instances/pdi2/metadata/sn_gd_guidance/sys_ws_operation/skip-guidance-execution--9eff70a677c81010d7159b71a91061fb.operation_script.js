(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var requestBody = request.body.data;
	var recommendedBy = requestBody.recommendedBy;
	var recommender = requestBody.recommender? requestBody.recommender : 'ga_decision_tree_execution';
	var responseStatus = 200;
	
	if(gs.nil(recommendedBy)){
		responseStatus = 400;
		response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Invalid request parameter')));
	}
	else {
		var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();	
		var isUserValid = guidanceModel.isUserValid(recommender, recommendedBy);
		if(!isUserValid){
			var accessDeniedResponseBody = {status:"400", errorType:"accessDenied", errorMessage:gs.getMessage("Access Denied: Check permissions to view the guidance")};
			response.setBody(accessDeniedResponseBody);
		}
		else {
			try{
				var guidedDecisionsExecution = new sn_gd_guidance.GuidedDecisionsGuidanceExecution();
				var status = 'error';
				status = guidedDecisionsExecution.skipGuidanceExecution(recommendedBy, recommender);
				var skipResult = {};
				var guidanceConstant = new sn_gd_guidance.GuidanceConstantsSNC();
				if(status && status.actionStatus == guidanceConstant.ERROR){
					responseStatus = 200;
				}
					skipResult.status = status;
			}
		catch(err){
			responseStatus = 500;
			response.setError(new sn_ws_err.NotFoundError(gs.getMessage('Could not skip the execution : {0}', [err + ''])));
		}
		finally{
			response.setStatus(responseStatus);
			response.setContentType('application/json');
			response.setBody(skipResult);
		}
		}
	}
})(request, response);

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestBody = request.body.data;
    var recommender = requestBody.recommender;
    var recommended_by = requestBody.recommended_by;
    var action_sys_id = requestBody.action_sys_id;
    var inputData = requestBody.inputData;

    var responseStatus = 200;
    var ErrorCode = {
        "InvalidArguments": 2
    };
    var apiResult = {};
    try {
        if (recommender && recommended_by && (inputData && action_sys_id)) {
			var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();	
			var isUserValid = guidanceModel.isUserValid(recommender, recommended_by);
			if(!isUserValid){
				var accessDeniedResponseBody={status:"400", errorType:"accessDenied", errorMessage:gs.getMessage("Access Denied: Check permissions to view the guidance")};
				response.setBody(accessDeniedResponseBody);
				return;
			}
            var guidedDecisionsExecution = new sn_gd_guidance.GuidedDecisionsGuidanceExecution();
            var result = guidedDecisionsExecution.updateGuidanceInstanceExecution(
                recommender, recommended_by, action_sys_id, inputData);
			var guidanceConstant = new sn_gd_guidance.GuidanceConstantsSNC();
			if(result.actionStatus == guidanceConstant.ERROR){
				responseStatus = 200;
				var responseBody = result;
				response.setStatus(responseStatus);
				response.setBody(responseBody);
				return;
			}
            if (result === ErrorCode.InvalidArguments) {
                responseStatus = 400;
                response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Invalid Record to update. Update Failed.')));
            } else if(typeof result === 'object' && result.guidanceDetails.state =='in_error' ) {
				response.setBody(result);
				
			} else {
                apiResult.message = "Input Values Updated successfully.";
                apiResult.status = "success";
                response.setBody(apiResult);
            }
        } else {
            responseStatus = 400;
            response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
        }
    } catch (err) {
        responseStatus = 500;
        var customErrObj = new sn_ws_err.ServiceError();
        customErrObj.setStatus(responseStatus);
        gs.error(JSON.stringify(err));
        customErrObj.setMessage(gs.getMessage('Updating Input Values Failed : {0}', [err + '']));
        response.setError(customErrObj);
		response.setStatus(responseStatus);
     } finally {
        response.setStatus(responseStatus);
        response.setContentType('application/json');
    }

})(request, response);

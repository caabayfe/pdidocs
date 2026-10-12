(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var receivedParams = request.pathParams;
    var sys_id = receivedParams.sys_id;
	if (gs.nil(sys_id)) {
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    }
	else {
        try {
            var interactionResponse = {};
            var guidanceConstants = new GuidanceConstants();
            var current = new GlideRecordSecure(guidanceConstants.GUIDANCE_TABLE);
            if (!current.get(sys_id)) {
                response.setError(new sn_ws_err.NotFoundError(gs.getMessage('Could not fetch form fields details for Guidance')));
                return;
            }

            var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
            var inputFormFields = guidanceModel.getformDetails(sys_id,'INPUTS');
            var outputFormFields = guidanceModel.getformDetails(sys_id,'OUTPUTS');
            var formDetails = {
				inputs : inputFormFields,
				outputs : outputFormFields
			}
			
            if (formDetails) {
                interactionResponse.formDetails = formDetails;
                response.setBody(interactionResponse);
                response.setStatus(200);
            } else {
				var errObj = new sn_ws_err.ServiceError();
                errObj.setStatus(500);
                errObj.setMessage(gs.getMessage('Error fetching guidance form fields details'));
                errObj.setDetail(gs.getMessage('Refer error logs for details'));
                response.setError(errObj);
			}

        } catch (err) {
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error fetching guidance form fields details'));
            response.setError(customErrObj);
            gs.error(JSON.stringify(err));
        }
    }

})(request, response);

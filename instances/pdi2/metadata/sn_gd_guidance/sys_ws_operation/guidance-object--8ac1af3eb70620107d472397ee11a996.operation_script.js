(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var receivedParams = request.pathParams;
    var recommender = receivedParams.recommender;
    var recommendedBy = receivedParams.recommended_by;

    response.setContentType('application/json');

    if (gs.nil(recommender) || gs.nil(recommendedBy)) {
        response.setError(new sn_ws_err.BadRequestError(gs.getMessage('Missing required parameters')));
    } else if (recommender == 'recommender' || recommendedBy == 'recommendedBy') {
        response.setBody({
            status: "Guidance currently unavailable"
        });
        response.setStatus(200);
    } else {
        try {
            var interactionResponse = {};
            var responseBody = {};
            var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
            var isUserValid = guidanceModel.isUserValid(recommender, recommendedBy);
            if (!isUserValid) {
                var accessDeniedResponseBody = {
                    status: "400",
                    errorType: "accessDenied",
                    errorMessage: gs.getMessage("Access Denied: Check permissions to view the guidance")
                };
                response.setBody(accessDeniedResponseBody);
                return;
            }
            var current = new GlideRecordSecure(recommender);
            if (!current.get(recommendedBy)) {
                responseBody = {
                    status: "405",
                    errorMessage: "invalid record"
                };
                response.setBody(responseBody);
                return;
            }

            var guidanceDetails = guidanceModel.getGuidanceObject(recommendedBy, recommender);
            if (guidanceDetails) {
                interactionResponse.guidanceDetails = guidanceDetails;
                response.setBody(interactionResponse);
                response.setStatus(200);
            } else {
                var guidanceErrorResponseBody = {
                    status: "400",
                    errorType: "guidanceError",
                    errorMessage: gs.getMessage("Error fetching guidance details")
                };
                response.setBody(guidanceErrorResponseBody);
            }
        } catch (err) {
            var customErrObj = new sn_ws_err.ServiceError();
            customErrObj.setStatus(500);
            customErrObj.setMessage(gs.getMessage('Error fetching guidance detail'));
            response.setError(customErrObj);
            gs.error(JSON.stringify(err));
        }
    }


})(request, response);

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    var experimentRequest = ExperimentRequest.fromJSON(request.body.data);

    if (gs.nil(experimentRequest.getExperimentKey())) {
        return new sn_ws_err.BadRequestError('No exp_key specified in request body');
    }

    if (gs.nil(experimentRequest.getFallbackVariantValue())) {
        return new sn_ws_err.BadRequestError('No fallback_variant specified in request body');
    }

    try {
        var context = new sn_experiment_core.ExperimentationAPI().getContext(experimentRequest);
        var errorMsg = context.getErrorMessage();
        if (errorMsg.trim() === "") {
            response.setStatus(200);
            return context.toObject();
        }

        var result = {
            "errorMsg": errorMsg,
        };
        response.setContentType("application/json");
        response.setStatus(400);
        response.setBody(result);

    } catch (e) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage('Failed in getContext' + e);
        return error;
    }



})(request, response);

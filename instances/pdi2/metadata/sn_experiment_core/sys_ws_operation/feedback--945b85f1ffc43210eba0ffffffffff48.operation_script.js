(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var requestBody = request.body.data;
        var json = new global.JSON();
        var dataMap = json.encode(requestBody);
        if (gs.nil(dataMap) || dataMap === '{}')
            return new sn_ws_err.BadRequestError('No message body specified');

		var experimentRequest = ExperimentRequest.fromJSON(request.body.data);

    if (gs.nil(experimentRequest.getExperimentKey())) {
        return new sn_ws_err.BadRequestError('No exp_key specified in request params');
    }

        var feedbackResponse = new sn_experiment_core.ExperimentationAPI().recordFeedback(experimentRequest);

        var errorMsg = feedbackResponse.getErrorMessage();
        if (errorMsg.trim() === "") {
            response.setStatus(200);
            return;
        }
        var result = {
            "errorMsg": errorMsg,
        };
        response.setContentType("application/json");
        response.setStatus(404);
        response.setBody(result);
    } catch (e) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage('Invalid JSON');
        return error;
    }

})(request, response);

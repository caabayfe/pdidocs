(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {


    var exp_param_name = request.queryParams.exp_param_name;
    if (gs.nil(exp_param_name)) {
        return new sn_ws_err.BadRequestError('No exp_param_name specified in request params');
    }
    var dataMap;
    var error;
    try {
        var requestBody = request.body.data;
        var json = new global.JSON();
        dataMap = json.encode(requestBody);
        if (gs.nil(dataMap) || dataMap === '{}')
            return new sn_ws_err.BadRequestError('No message body specified');
    } catch (e) {
        error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage('Invalid JSON');
        return error;
    }


    var feedbackResponse = ExperimentationService.recordFeedback(exp_param_name, JSON.parse(dataMap));
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

})(request, response);

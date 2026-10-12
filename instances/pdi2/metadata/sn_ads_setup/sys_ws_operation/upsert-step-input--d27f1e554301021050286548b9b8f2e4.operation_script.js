(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var restHandler, result, setupId, data;
    try {
        stepId = request.pathParams.step_id;
        restHandler = new SNHelpSetupRestHandler();
        data = request.body.data;
        result = restHandler.upsertStepInputInInteractionStepTable(stepId, data);
        response.setStatus(result.status);
        if (result.data)
            response.setBody(result.data);
        else
            response.setBody({
                error: result.message || result.error
            });

    } catch (ex) {
        response.setStatus(500);
        response.setBody({
            error: "Internal Server Error " + ex
        });
    }

})(request, response);

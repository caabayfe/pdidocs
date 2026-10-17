(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var restHandler, result = {}, setupId, reqParams;

    try {
        setupId = request.pathParams.setup_id;
        restHandler = new SNHelpSetupRestHandler();
        reqParams = request.body.data;
        if (Array.isArray(reqParams) && reqParams.length) {
            result = restHandler.createInteractionForGuidedSetup(setupId, reqParams);
        } else {
            result.status = 400;
            result.message = gs.getMessage("Invalid request payload");
        }

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

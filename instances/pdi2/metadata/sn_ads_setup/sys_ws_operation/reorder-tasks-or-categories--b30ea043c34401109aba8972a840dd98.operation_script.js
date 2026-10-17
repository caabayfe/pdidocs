(function process(request, response) {
    try {
        var restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
        if (request.body.data && request.pathParams.setupId) {
            var result = restHandler.reorder(request.pathParams.setupId, request.body.data);
            response.setStatus(result.status);
            response.setBody({
                message: result.message,
                data: result.data
            });
        } else {
            response.setStatus(404);
            response.setBody({
                message: "Missing request parameters"
            });
        }
    } catch (err) {
        response.setStatus(500);
        gs.error("SNHelpSetupRestHandler: " + err.message);
        response.setBody({
            message: "Internal server error: " + err.message
        });
    }
})(request, response);

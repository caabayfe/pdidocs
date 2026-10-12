(function process(request, response) {
    var restHandler, result;
    try {
        restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
        var bodyData = request.body.data,
            interactionId = "";
        if (bodyData) {
            interactionId = bodyData.interaction_id;
        }

        result = restHandler.setGuidanceAutoComplete(request.pathParams.sys_id, interactionId);

        response.setStatus(result.status);

        if (result.error) {
            response.setBody({
                error: result.error
            });
        } else {
            response.setBody(result.data);
        }

    } catch (e) {
        response.setStatus(500);
        gs.error("SNHelpSetupRestHandler: " + e.message);
        response.setBody({
            error: "Internal server error"
        });
    }
})(request, response);

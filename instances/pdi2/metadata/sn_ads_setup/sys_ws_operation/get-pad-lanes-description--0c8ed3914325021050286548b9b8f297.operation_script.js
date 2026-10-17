(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var restHandler, result, context_lane_sys_ids;
    try {
        restHandler = new sn_ads_setup.SNHelpSetupRestHandler();
        context_lane_sys_ids = request.pathParams.context_lane_sys_ids;
        result = restHandler.getPDLaneDescriptions(context_lane_sys_ids);
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

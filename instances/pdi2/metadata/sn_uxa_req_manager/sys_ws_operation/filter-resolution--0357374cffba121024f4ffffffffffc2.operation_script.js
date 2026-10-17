(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const {
            payload,
            filterType,
            source,
            mode
        } = request.body.data;
        const uxaParDashboardHandler = new sn_uxa_req_manager.UXADAFilterService();
        const resolutionAPIResponse = uxaParDashboardHandler.handleResolutionApi(
            payload,
            filterType,
            UXAConstants.APPSEE,
            source,
            mode
        );
        response.setStatus(200);
        response.setBody(resolutionAPIResponse);
    } catch (ex) {
        gs.error("Error while fetching resolution api");
        gs.error(ex.stack);
        response.setStatus(500);
        response.setBody({
            'error': "Error occured while fecthing resolution api"
        });
    }
})(request, response);

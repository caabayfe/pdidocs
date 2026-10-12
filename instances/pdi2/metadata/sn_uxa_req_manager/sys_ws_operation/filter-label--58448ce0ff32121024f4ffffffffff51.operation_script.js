(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

     try {
        const {
            payload
        } = request.body.data;
        const uxaParDashboardHandler =  new sn_uxa_req_manager.UXADAFilterService();
        const label = uxaParDashboardHandler.handleLabelApi(payload['UXAFilterId']);

        const result = {
            'value': label
        };

        response.setStatus(200);
        response.setBody(result);
    } catch (ex) {
        gs.error("Error while fetching labels for filters");
        gs.error(ex.stack);
        response.setStatus(500);
        response.setBody({
            'error': "Error occured while fecthing labels"
        });
    }

})(request, response);

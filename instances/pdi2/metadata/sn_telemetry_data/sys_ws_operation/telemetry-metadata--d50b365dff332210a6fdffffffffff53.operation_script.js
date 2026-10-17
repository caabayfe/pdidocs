(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const params = request.body?.data ?? {};
        const telemetryDataHandler = new TelemetryDataHandler();
        const result = telemetryDataHandler.getMetadata(params);

        response.setStatus(200);
        response.setBody(result);
    } catch (ex) {
        gs.error("Error while fetching Telemetry Data");
        gs.error(ex.stack);
        response.setStatus(500);
        response.setBody({
            'error': "Error occurred while fetching Telemetry Data."
        });
    }

})(request, response);

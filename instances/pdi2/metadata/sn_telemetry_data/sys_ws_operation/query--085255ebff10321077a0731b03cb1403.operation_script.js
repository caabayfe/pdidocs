(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var data = new TelemetryDataHandler().handleQueryRequest(request.body?.data);
        response.setContentType('application/json');
        response.setBody(data);
        response.setStatus(200);
    } catch (err) {
        response.setError("Error occurred while querying the telemetry data.");
        response.setStatus(500);
    }
    return response;

})(request, response);

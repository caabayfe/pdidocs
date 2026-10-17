(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var params = request.body.data;
        const uxaHandler = new UXAHandler();
        const result = uxaHandler.handleFunnelRequest(params);
        response.setBody(result);
        response.setContentType('application/json');
        response.setStatus(200);
        return response;
    } catch (error) {
        response.setStatus(500);
        response.setError(UXAError.getGenericError(error));
        return response;
    }
})(request, response);

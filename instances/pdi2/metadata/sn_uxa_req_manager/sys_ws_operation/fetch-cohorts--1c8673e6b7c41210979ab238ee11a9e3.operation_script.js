(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
		const params = request.queryParams;
        const uxaHandler = new UXAHandler(); 
		const result = uxaHandler.handleCohortRequest(params, true);
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

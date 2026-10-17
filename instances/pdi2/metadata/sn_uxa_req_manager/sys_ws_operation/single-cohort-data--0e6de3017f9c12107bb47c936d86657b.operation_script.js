(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const params = {
            ...request.body.data,
            isSingle: true
        };
        const uxaHandler = new UXAHandler();
        const result = uxaHandler.handleCohortRequest(params, true);
        response.setBody(result);
        response.setContentType('application/json');
        response.setStatus(200);
        return response;

    } catch (err) {
        const serviceError = new UXAUtils().generateErrorObject(err);
        response.setError(serviceError);
        response.setStatus(err?.statusCode || 500);
    }
})(request, response);

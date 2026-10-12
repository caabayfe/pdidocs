(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        const data = new UXAHandler().handleDARequest(request.body?.data);
        response.setContentType('application/json');
        response.setBody(data);
        response.setStatus(200);
    } catch (err) {
        const serviceError = new UXAUtils().generateErrorObject(err);
        response.setError(serviceError);
        response.setStatus(err?.statusCode || 500);
    }
    return response;
})(request, response);

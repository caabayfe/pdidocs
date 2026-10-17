(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        return (new JsonAttributeService()).getJSON(request.pathParams);
    } catch (error) {
        new ErrorHandler().throwSnWsError(error);
    }

})(request, response);

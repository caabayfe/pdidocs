(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    return new SessionService().getSessionInfo(request.body.data);
})(request, response);

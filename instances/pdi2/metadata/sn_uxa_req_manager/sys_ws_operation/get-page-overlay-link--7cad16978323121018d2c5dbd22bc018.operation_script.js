(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        const params = request.queryParams;
        const applicationId = params["applicationId"][0];
        const pageId = params["pageId"][0];
        const pageOverlayHandler = new PageOverlayUtils();
        var result = pageOverlayHandler.getLinkInfo(applicationId, pageId);
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

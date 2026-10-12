(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const url = request.queryParams.url;
    const checker = new IframeEmbedCheckService();
    const result = checker.checkUrlEmbeddability(url);
    response.setStatus(result.statusCode);
    return result.body;
})(request, response);

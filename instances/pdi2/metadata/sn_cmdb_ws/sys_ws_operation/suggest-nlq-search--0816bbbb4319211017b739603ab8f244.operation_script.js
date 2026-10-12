(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var nlqApi = sn_nlq.JavascriptProcessorScoped;
    if (!nlqApi) {
        response.setStatus(404);
        response.setError(new sn_ws_err.NotFoundError("The NLQ Scripted API is only supported in Vancouver and above."));
        return response;
    }

})(request, response);

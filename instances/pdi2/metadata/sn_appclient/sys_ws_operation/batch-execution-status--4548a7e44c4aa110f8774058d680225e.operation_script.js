(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var tracker = new ProgressTracker();
    try {
        var batchId = request.pathParams.batchId;  
        var result = tracker.getBatchInstallStatus(batchId);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

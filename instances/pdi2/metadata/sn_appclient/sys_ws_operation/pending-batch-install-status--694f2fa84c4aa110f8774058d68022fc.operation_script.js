(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var tracker = new ProgressTracker();
    try {
        var result = tracker.getPendingBatchInstallations();
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

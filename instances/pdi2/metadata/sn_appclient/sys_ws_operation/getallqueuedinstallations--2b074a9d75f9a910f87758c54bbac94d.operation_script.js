(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var tracker = new ProgressTracker();
    try {
        var params = appManagerApiUtil.getRequestParams();
        var result = tracker.getAllQueuedInstallations(params, appManagerApiUtil);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

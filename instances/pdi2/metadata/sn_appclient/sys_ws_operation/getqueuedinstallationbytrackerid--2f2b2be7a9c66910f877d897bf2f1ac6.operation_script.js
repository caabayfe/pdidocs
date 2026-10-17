(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var tracker = new ProgressTracker();
    try {
        trackerId = request.pathParams.trackerId;
        var result = tracker.getQueuedInstallationByTrackerId(trackerId);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

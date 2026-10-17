(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var tracker = new ProgressTracker();
    try {
        var trackerId = request.pathParams.trackerId;  
        var result = tracker.getProgress(trackerId);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

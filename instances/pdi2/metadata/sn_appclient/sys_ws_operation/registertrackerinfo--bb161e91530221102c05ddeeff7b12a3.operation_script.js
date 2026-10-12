(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var trackerInfo = appManagerApiUtil.getRequestBody();
        CommonUtils.addProgressTracker(trackerInfo, trackerInfo.response, trackerInfo.appId, trackerInfo.type, trackerInfo.mode);
        appManagerApiUtil.setResponseBody({
            "registered": true
        });
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

})(request, response);

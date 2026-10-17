(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var args = appManagerApiUtil.getRequestParams();
        var responseData = new AppInfoService().getInstanceAppInfo(args);
        appManagerApiUtil.setResponseBody(responseData);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

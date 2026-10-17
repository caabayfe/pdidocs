(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var appInfoService = new AppInfoService();
        var data = appInfoService.getApps(appManagerApiUtil);
        appManagerApiUtil.setResponseBody(data);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

})(request, response);

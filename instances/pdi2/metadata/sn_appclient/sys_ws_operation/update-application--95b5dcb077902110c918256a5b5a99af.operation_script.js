(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var handler = new AppManagerHandler();
    try {
        appManagerApiUtil.verifyTablesReadAccess(["sys_store_app"]);
        var requestParams = appManagerApiUtil.getRequestParams();
        var result = handler.updateApp(requestParams);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

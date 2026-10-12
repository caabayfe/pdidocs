(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    var handler = new AppManagerHandler();
    try {
        appManagerApiUtil.verifyTablesReadAccess(["v_plugin"]);
        var requestParams = appManagerApiUtil.getRequestParams();
        var result = handler.repairPlugin(requestParams);
        appManagerApiUtil.setResponseBody(result);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

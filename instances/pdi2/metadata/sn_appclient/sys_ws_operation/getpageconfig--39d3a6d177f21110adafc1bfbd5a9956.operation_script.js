(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var pageConfig = new sn_appclient.AppManagerPageConfigurationUtil().getPageConfigurations();
        appManagerApiUtil.setResponseBody(pageConfig);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

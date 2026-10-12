(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var requestParams = appManagerApiUtil.getRequestParams();
        var helper = new PluginInfoHelper();
        var pluginResponse = helper.getPlugin(requestParams);
        appManagerApiUtil.setResponseBody(pluginResponse);
    } catch (err) {
        appManagerApiUtil.setResponseBody(err);
    }
})(request, response);

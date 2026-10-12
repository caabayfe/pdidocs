(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var helper = new PluginInfoHelper();
        var pluginResponse = helper.getPlugins(appManagerApiUtil);
        appManagerApiUtil.setResponseBody(pluginResponse);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }
})(request, response);

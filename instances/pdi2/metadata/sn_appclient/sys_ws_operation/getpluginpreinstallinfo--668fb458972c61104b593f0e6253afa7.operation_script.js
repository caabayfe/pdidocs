(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var args = appManagerApiUtil.getRequestParams();
        var pluginPreInstallService = new PluginPreInstallService();
        var responseData = pluginPreInstallService.getPreInstallPluginInfo({
            "id": args.queryParams.id,
            "scope":  args.queryParams.scope
        });
        appManagerApiUtil.setResponseBody(responseData);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

})(request, response);

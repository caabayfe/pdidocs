(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        var args = appManagerApiUtil.getRequestParams();
        var plugin_id = args.queryParams['plugin_id'];
        var appId = args.queryParams['app_id'];
        var type, id;
        if (appId) {
            appManagerApiUtil.verifyTablesReadAccess(["sys_store_app", "sys_remote_app"]);
            type = Constants.APPLICATION;
            id = appId;
        } else {
            appManagerApiUtil.verifyTablesReadAccess(["v_plugin"]);
            type = Constants.PLUGIN;
            id = plugin_id;
        }
        var trackerId = new global.PluginsData().loadDemoData(plugin_id);
        var trackerPayload = { trackerId: trackerId };
        var inputPayload = args.queryParams;
        CommonUtils.addProgressTracker(inputPayload, trackerPayload, id, type, Constants.LOAD_DEMO_DATA);
        appManagerApiUtil.setResponseBody(trackerPayload);
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

})(request, response);

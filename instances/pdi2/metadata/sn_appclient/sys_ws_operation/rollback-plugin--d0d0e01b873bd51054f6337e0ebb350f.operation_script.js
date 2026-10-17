(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        appManagerApiUtil.verifyTablesReadAccess(["v_plugin"]);
        var args = appManagerApiUtil.getRequestParams();
        var plugin_id = args.queryParams['plugin_id'];
        var rctxid = args.queryParams['rctxid'];

        if(!rctxid){
            var trackerPayload = new global.PluginsData().rollbackPlugin(plugin_id);
            var inputPayload = args.queryParams;
            CommonUtils.addProgressTracker(inputPayload, trackerPayload, plugin_id, Constants.PLUGIN, Constants.ROLLBACK);
            appManagerApiUtil.setResponseBody(trackerPayload);
        }else{
            var rollbackRunId = new global.PluginsData().getRollbackRunId(rctxid);
            var rollbackRunIdResponse = { rollbackRunId: rollbackRunId };
            appManagerApiUtil.setResponseBody(rollbackRunIdResponse);
        }
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

    })(request, response);

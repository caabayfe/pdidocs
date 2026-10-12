(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appManagerApiUtil = new AppManagerApiUtil(request, response);
    try {
        appManagerApiUtil.verifyTablesWriteAccess(["sys_installation_schedule", "sys_installation_schedule_item"]);
        var scheduleService = new ScheduledInstallService();
        var args = appManagerApiUtil.getRequestParams();
        var requestBody = appManagerApiUtil.getRequestBody();
        var queryParams = args.queryParams;
        var requestParams = {};
        requestParams.action = queryParams.action;
        requestParams.schedule = JSON.stringify(requestBody);
        requestParams.schedule_id = queryParams.schedule_id;
        requestParams.source_app_id = queryParams.source_app_id;
        requestParams.scheduled_time = queryParams.scheduled_time;
        requestParams.appCount = queryParams.appCount;

        var responseContent = scheduleService.processRequest(requestParams);
        if (responseContent.statusCode == 200) {
            appManagerApiUtil.setResponseBody(responseContent.responseData);
        } else {
            appManagerApiUtil.setError({
                errorCode: responseContent.statusCode,
                errorDescription: responseContent.responseData.error
            });
        }
    } catch (err) {
        appManagerApiUtil.setError(err);
    }

})(request, response);

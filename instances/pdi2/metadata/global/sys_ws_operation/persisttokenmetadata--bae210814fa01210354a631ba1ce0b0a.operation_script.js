(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var params = request.body.data;
        var sysId = request.queryParams.sys_id;
        var tokenManager = new SplunkTokenManager();
        var recordSysId = tokenManager.updateToken(params, sysId);
        response.setStatus(200);
        response.setBody({
            message: "Record updated successfully.",
            sys_id: recordSysId
        });
    } catch (e) {
        gs.error("Update Token: Error occurred:" + e.message);
        response.setStatus(500);
        response.setBody({ error: e.message });
    }
})(request, response);

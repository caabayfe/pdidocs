(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    /**
     * Sync application source files to application metadata
     */
    try {
        var body = request.body.data;
        var scopeId = body.sys_scope;
        var transactionId = new global.IDEGlobalUtils().getTransactionId();
        var ideService = new sn_glider.IDERequestBuilder();
        var stopWatch = new sn_glider.StopWatch();
        if (!scopeId) {
            response.setBody(ideService.failureResponse('[transactionId: ' + transactionId + '] Scope ID was not defined! Cannot handle sync request.'));
            return response.setStatus(400);
        }
        var syncRequest = ideService.createSyncRequest(scopeId, transactionId);
        stopWatch.time('sync:execute');
        var syncResponse = syncRequest.execute();
        stopWatch.timeEnd('sync:execute', '[sync:execute][scope:' + scopeId + '][transactionId: ' + transactionId + ']');
        var result = ideService.handleSyncResponse(scopeId, syncResponse, transactionId);
        response.setBody(ideService.successResponse('[transactionId: ' + transactionId + '] Successfully synced and updated, ' + scopeId, result.logs, result.status));
        return response.setStatus(200);
    } catch (e) {
        gs.error('sync request failed', e);
        var svcErr = new sn_ws_err.ServiceError();
        svcErr.setMessage(e.message || e.toString());
        if (e.detailedLog) {
            svcErr.setDetail(e.detailedLog);
        }
        response.setError(svcErr);
        svcErr.setStatus(500);
        return response.setError(svcErr);
    }
})(request, response);
